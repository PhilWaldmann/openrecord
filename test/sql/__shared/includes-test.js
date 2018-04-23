var should = require('should')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Includes', function() {
    var store, store2

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store2 = new Store({
        type: 'rest',
        url: 'http://localhost:8889',
        version: '~1.0',
        name: 'IncludeRestStore'
      })

      store.Model('User', function() {
        this.hasMany('posts', { scope: 'sorted' })
        this.hasMany('posts_contains', { model: 'Post', scope: 'contains' })
        this.hasMany('threads')
        this.hasOne('avatar')
        this.hasMany('unread_posts')
        this.hasMany('unread', { through: 'unread_posts' })
        this.hasOne('last_post', {
          model: 'Post',
          scope: 'recent',
          bulkFetch: false
        }) // scope per record! => expensive!! (the leading `!`)
        this.hasMany('unread_threads', {
          through: 'unread',
          relation: 'thread'
        })
        this.hasMany('poly_things')
        this.hasMany('members', { through: 'poly_things', relation: 'member' })
        this.belongsTo('user', { store: 'IncludeRestStore', from: 'id' })
      })
      store.Model('Avatar', function() {
        this.belongsTo('user')
        this.hasMany('poly_things', { as: 'member' })
      })
      store.Model('Post', function() {
        this.belongsTo('user')
        this.belongsTo('thread')
        this.belongsTo('thread_autor', { through: 'thread', relation: 'user' })

        this.scope('recent', function() {
          this.order('id', true).first()
        })

        this.scope('sorted', function() {
          this.order('thread_id', true).order('message')
        })

        this.scope('contains', function(str) {
          this.where({ message_like: str })
        })
      })
      store.Model('Thread', function() {
        this.belongsTo('user')
        this.hasMany('posts')
      })
      store.Model('UnreadPost', function() {
        this.belongsTo('user')
        this.belongsTo('unread', { model: 'Post' })
      })
      store.Model('PolyThing', function() {
        this.belongsToPolymorphic('member')
      })

      store2.Model('User', function() {
        this.attribute('id', Number, { primary: true })
        this.attribute('login', String)
        this.attribute('email', String)

        this.hasMany('posts')
      })

      store2.Model('Post', function() {
        this.attribute('id', Number, { primary: true })
        this.attribute('message', String)
        this.attribute('user_id', Number)
        this.attribute('thread_id', Number)

        this.belongsTo('user')
      })

      return Promise.all([store.ready(), store2.ready()])
    })

    describe('include()', function() {
      it('throws an error on unknown relation', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.include('unknown')
          })
          .should.be.rejectedWith(Error, {
            message: 'Can\'t find relation "unknown" for User'
          })
      })

      it('throws an error on unknown nested relation', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.include({ unknown: 'posts' })
          })
          .should.be.rejectedWith(Error, {
            message: 'Can\'t find relation "unknown" for User'
          })
      })

      it('include does not join tables', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('posts').toSql(function(sql) {
            sql.should.be.equal('select * from "users"')
          })
        })
      })

      it('returns the right results on a simple include', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('posts')
            .order('users.id')
            .exec(function(result) {
              result[0].login.should.be.equal('phil')
              result[0]._posts.length.should.be.equal(3)
              result[1].login.should.be.equal('michl')
              result[1]._posts.length.should.be.equal(1)
              result[2].login.should.be.equal('admin')
              result[2]._posts.length.should.be.equal(0)
            })
        })
      })

      it('calls the related scope method', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('posts')
            .order('users.id')
            .exec(function(result) {
              result[0].login.should.be.equal('phil')
              result[0]._posts
                .toJSON()
                .should.be.eql([
                  { id: 3, user_id: 1, thread_id: 2, message: 'third' },
                  { id: 1, user_id: 1, thread_id: 1, message: 'first message' },
                  { id: 2, user_id: 1, thread_id: 1, message: 'second' }
                ])
            })
        })
      })

      it('calls the related scope method with args', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include({ posts_contains: { $args: ['sec'] } })
            .order('users.id')
            .exec(function(result) {
              result = result.toJSON()

              result[0].login.should.be.equal('phil')
              result[0].posts_contains.should.be.eql([
                { id: 2, user_id: 1, thread_id: 1, message: 'second' }
              ])
              result[1].login.should.be.equal('michl')
              result[1].posts_contains.length.should.be.equal(0)
              result[2].login.should.be.equal('admin')
              result[2].posts_contains.length.should.be.equal(0)
            })
        })
      })

      it('returns the right results on multiple includes', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('posts', 'threads')
            .order('users.id')
            .exec(function(result) {
              result[0].login.should.be.equal('phil')
              result[0]._posts.length.should.be.equal(3)
              result[0]._threads.length.should.be.equal(1)
              result[1].login.should.be.equal('michl')
              result[1]._posts.length.should.be.equal(1)
              result[1]._threads.length.should.be.equal(1)
              result[2].login.should.be.equal('admin')
              result[2]._posts.length.should.be.equal(0)
              result[2]._threads.length.should.be.equal(0)
            })
        })
      })

      it('returns the right results on multiple nested includes', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include({ threads: 'posts' })
            .order('users.id')
            .exec(function(result) {
              result[0].login.should.be.equal('phil')
              should.not.exist(result[0]._posts)
              result[0]._threads.length.should.be.equal(1)
              result[0]._threads[0]._posts.length.should.be.equal(1)
              result[1].login.should.be.equal('michl')
              should.not.exist(result[1]._posts)
              result[1]._threads.length.should.be.equal(1)
              result[1]._threads[0]._posts.length.should.be.equal(3)
              result[2].login.should.be.equal('admin')
              should.not.exist(result[2]._posts)
              result[2]._threads.length.should.be.equal(0)
            })
        })
      })

      it('returns the right results on deep nested includes', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include({ threads: { posts: 'user' } })
            .order('users.id')
            .exec(function(result) {
              result[0].login.should.be.equal('phil')
              should.not.exist(result[0]._posts)
              result[0]._threads.length.should.be.equal(1)
              result[0]._threads[0]._posts.length.should.be.equal(1)
              result[0]._threads[0]._posts[0]._user.login.should.be.equal(
                'phil'
              )
              result[1].login.should.be.equal('michl')
              should.not.exist(result[1]._posts)
              result[1]._threads.length.should.be.equal(1)
              result[1]._threads[0]._posts.length.should.be.equal(3)
              result[2].login.should.be.equal('admin')
              should.not.exist(result[2]._posts)
              result[2]._threads.length.should.be.equal(0)
            })
        })
      })

      it('returns the right results on multiple nested includes and nested conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          // joins the threads table....
          return User.include({ threads: 'posts' })
            .where({ threads: { title_like: 'first' } })
            .order('users.id')
            .exec(function(result) {
              result[0].login.should.be.equal('phil')
              result[0]._threads.length.should.be.equal(0)

              result[1].login.should.be.equal('michl')
              result[1]._threads.length.should.be.equal(1)
              result[1]._threads[0]._posts.length.should.be.equal(3)
            })
        })
      })

      it('returns the right results on multiple nested includes and nested conditions (attribute = attribute)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          // joins the threads table....
          return User.include({ threads: 'posts' })
            .where({ threads: { id: { $attribute: 'user_id' } } })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._threads.length.should.be.equal(0)
              result[1]._threads.length.should.be.equal(0)
              result[2]._threads.length.should.be.equal(0)
            })
        })
      })

      it('Loads the user but no posts', function() {
        return store.ready(function() {
          var User = store.Model('User')
          // joins the threads table....
          return User.include('posts')
            .where({ posts: { message_like: 'unknown' } })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._posts.length.should.be.equal(0)
              result[1]._posts.length.should.be.equal(0)
              result[2]._posts.length.should.be.equal(0)
            })
        })
      })

      it('Loads the user and their threads but no posts', function() {
        return store.ready(function() {
          var User = store.Model('User')
          // joins the threads table....
          return User.include({ threads: 'posts' })
            .where({ threads: { posts: { message_like: 'unknown' } } })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._threads.length.should.be.equal(1)
              result[0]._threads[0]._posts.length.should.be.equal(0)
              result[1]._threads.length.should.be.equal(1)
              result[1]._threads[0]._posts.length.should.be.equal(0)
              result[2]._threads.length.should.be.equal(0)
            })
        })
      })

      it('returns the right results on hasOne relations', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('avatar').exec(function(result) {
            result.length.should.be.equal(3)
            result[0]._avatar.url.should.be.equal(
              'http://awesome-avatar.com/avatar.png'
            )
            should.not.exist(result[1]._avatar)
            should.not.exist(result[2]._avatar)
          })
        })
      })

      it('returns the right results on hasMany through', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('unread')
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._unread.length.should.be.equal(1)
              result[1]._unread.length.should.be.equal(0)
              result[2]._unread.length.should.be.equal(0)
            })
        })
      })

      it('returns the right results on nested hasMany through', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('unread_threads')
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._unread_threads.length.should.be.equal(1)
              result[0]._unread_threads[0].title.should.be.equal(
                'second thread'
              )
              result[1]._unread_threads.length.should.be.equal(0)
              result[2]._unread_threads.length.should.be.equal(0)
            })
        })
      })

      it('returns the right results on belongsTo through', function() {
        return store.ready(function() {
          var Post = store.Model('Post')
          return Post.include('thread_autor')
            .order('posts.id')
            .exec(function(result) {
              result.length.should.be.equal(4)
              result[0]._thread_autor.login.should.be.equal('michl')
              result[1]._thread_autor.login.should.be.equal('michl')
              result[2]._thread_autor.login.should.be.equal('phil')
              result[3]._thread_autor.login.should.be.equal('michl')
            })
        })
      })

      it('returns the right results on sub nested hasMany through', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include({ threads: { user: 'unread_threads' } })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._threads.length.should.be.equal(1)
              result[1]._threads.length.should.be.equal(1)
              result[2]._threads.length.should.be.equal(0)

              result[0]._threads[0]._user._unread_threads.length.should.be.equal(
                1
              )
              result[1]._threads[0]._user._unread_threads.length.should.be.equal(
                0
              )
            })
        })
      })

      it('returns the right results on sub nested hasMany through with conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include({ threads: { user: 'unread_threads' } })
            .where({
              threads: { user: { unread_threads: { title_like: 'unknown' } } }
            })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._threads.length.should.be.equal(1)
              result[1]._threads.length.should.be.equal(1)
              result[2]._threads.length.should.be.equal(0)

              result[0]._threads[0]._user._unread_threads.length.should.be.equal(
                0
              )
              result[1]._threads[0]._user._unread_threads.length.should.be.equal(
                0
              )
            })
        })
      })

      it('returns the right results on sub nested hasMany through with custom conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include({ threads: { user: 'unread_threads' } })
            .where({
              threads: { user: { unread_threads: ['title like ?', 'second%'] } }
            })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)

              result[0]._threads.length.should.be.equal(1)
              result[1]._threads.length.should.be.equal(1)
              result[2]._threads.length.should.be.equal(0)

              result[0]._threads[0]._user._unread_threads.length.should.be.equal(
                1
              )
              result[1]._threads[0]._user._unread_threads.length.should.be.equal(
                0
              )
            })
        })
      })

      it('returns a polymorphic relation', function() {
        return store.ready(function() {
          var PolyThing = store.Model('PolyThing')
          var Post = store.Model('Post')
          var Thread = store.Model('Thread')
          var Avatar = store.Model('Avatar')
          return PolyThing.include('member')
            .order('poly_things.id')
            .exec(function(result) {
              result.length.should.be.equal(4)
              result[0]._member.should.be.an.instanceOf(Post)
              result[1]._member.should.be.an.instanceOf(Thread)
              result[2]._member.should.be.an.instanceOf(Thread)
              result[3]._member.should.be.an.instanceOf(Avatar)
            })
        })
      })

      it('returns a nested polymorphic relation', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var Post = store.Model('Post')
          var Thread = store.Model('Thread')
          var Avatar = store.Model('Avatar')
          return User.include({ poly_things: 'member' })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._poly_things.length.should.be.equal(2)
              result[1]._poly_things.length.should.be.equal(2)
              result[0]._poly_things[0]._member.should.be.an.instanceOf(Post)
              result[0]._poly_things[1]._member.should.be.an.instanceOf(Thread)
              result[1]._poly_things[0]._member.should.be.an.instanceOf(Thread)
              result[1]._poly_things[1]._member.should.be.an.instanceOf(Avatar)
              result[2]._poly_things.length.should.be.equal(0)
            })
        })
      })

      it('returns a hasMany through polymorphic relation', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var Post = store.Model('Post')
          var Thread = store.Model('Thread')
          var Avatar = store.Model('Avatar')
          return User.include('members')
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._members.length.should.be.equal(2)
              result[1]._members.length.should.be.equal(2)
              result[0]._members[0].should.be.an.instanceOf(Post)
              result[0]._members[1].should.be.an.instanceOf(Thread)
              result[1]._members[0].should.be.an.instanceOf(Thread)
              result[1]._members[1].should.be.an.instanceOf(Avatar)
              result[2]._members.length.should.be.equal(0)
            })
        })
      })

      it('returns a hasMany through polymorphic relation with sub includes', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include({ members: ['user'] })
            .order('users.id')
            .exec(function(result) {
              result.length.should.be.equal(3)
              result[0]._members.length.should.be.equal(2)
              result[1]._members.length.should.be.equal(2)
              result[0]._members[0]._user.login.should.be.equal('phil')
              result[0]._members[1]._user.login.should.be.equal('michl')
              result[1]._members[0]._user.login.should.be.equal('phil')
              result[1]._members[1]._user.login.should.be.equal('phil')
              result[2]._members.length.should.be.equal(0)
            })
        })
      })

      it('returns a the polymorphic relation from the other side', function() {
        return store.ready(function() {
          var Avatar = store.Model('Avatar')
          return Avatar.find(1)
            .include('poly_things')
            .exec(function(result) {
              result.id.should.be.equal(1)
              result._poly_things.length.should.be.equal(1)
              result._poly_things[0].member_type.should.be.equal('Avatar')
              result._poly_things[0].member_id.should.be.equal(result.id)
            })
        })
      })

      it('does only one include, even include(table) was called twice', function() {
        return store.ready(function() {
          var Avatar = store.Model('Avatar')
          return Avatar.find(1)
            .include('poly_things')
            .include('poly_things')
            .exec(function(result) {
              result.id.should.be.equal(1)
              result._poly_things.length.should.be.equal(1)
              result._poly_things[0].member_type.should.be.equal('Avatar')
              result._poly_things[0].member_id.should.be.equal(result.id)
            })
        })
      })

      it('Include a cross store relation', function() {
        return Promise.all([store.ready(), store2.ready()]).then(function() {
          var User = store.Model('User')
          return User.include('user').exec(function(result) {
            result.length.should.be.equal(3)

            result[0].id.should.be.equal(result[0]._user.id)
            result[0].email.should.not.be.equal(result[0]._user.email)
          })
        })
      })

      it('Include a cross store relation with a subrelation', function() {
        return Promise.all([store.ready(), store2.ready()]).then(function() {
          var User = store.Model('User')
          return User.include({ user: 'posts' }).exec(function(result) {
            result.length.should.be.equal(3)

            result[0]._user._posts.length.should.be.equal(3)
            result[1]._user._posts.length.should.be.equal(1)
          })
        })
      })

      it('include a relation with scope per record', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.include('last_post').exec(function(result) {
            result.length.should.be.equal(3)
            result[0]._last_post.id.should.be.equal(3)
            result[1]._last_post.id.should.be.equal(4)
          })
        })
      })

      it('include relations for a already loaded record', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(1).exec(function(user) {
            return user
              .include('posts')
              .exec()
              .then(function(result) {
                result.id.should.be.equal(1)
                result._posts.length.should.be.equal(3)
                true.should.be.equal(result === user)
                user._posts.length.should.be.equal(3)
              })
          })
        })
      })

      it('load included relations again', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(1)
            .include('posts')
            .then(function(user) {
              return user.posts.where({ message: 'third' })
            })
            .then(function(posts) {
              posts.length.should.be.equal(1)
            })
        })
      })

      it('preloaded relations are now separated from the original record', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var origPosts
          return User.find(1)
            .include('posts')
            .then(function(user) {
              origPosts = user.posts
              return user.posts.where({ message: 'third' })
            })
            .then(function(posts) {
              posts.should.not.be.equal(origPosts)
              origPosts.length.should.be.equal(3)
            })
        })
      })

      it('load not included relation', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(1)
            .then(function(user) {
              return user.posts.where({ message: 'third' })
            })
            .then(function(posts) {
              posts.length.should.be.equal(1)
            })
        })
      })

      it('use bulk loading', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.then(function(users) {
            return Promise.all(
              users.map(function(user) {
                return user.posts
              })
            )
          }).then(function(posts) {
            posts[0].length.should.be.equal(3)
            posts[1].length.should.be.equal(1)
            posts[2].length.should.be.equal(0)
          })
        })
      })
    })
  })
}
