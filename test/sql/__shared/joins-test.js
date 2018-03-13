var should = require('should')
var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Joins', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      store.Model('User', function(){
        this
        .hasMany('posts')
        .hasMany('threads')
        .hasOne('avatar')
        .hasMany('unread_posts')
        .hasMany('unread', {through: 'unread_posts'})
        .hasMany('unread_threads', {through: 'unread', relation: 'thread'})
      })
      store.Model('Avatar', function(){
        this.belongsTo('user')
        this.hasMany('poly_things', {as: 'member'})
      })
      store.Model('Post', function(){
        this.belongsTo('user')
        this.belongsTo('thread')
        this.belongsTo('thread_autor', {through: 'thread', relation: 'user'})
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts')
      })
      store.Model('UnreadPost', function(){
        this.belongsTo('user')
        this.belongsTo('unread', {model: 'Post'})
      })
      store.Model('PolyThing', function(){
        this.belongsTo('member', {polymorph: true})
      })
    })






    describe('join()', function(){
      it('throws an error on unknown relation', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join('unknown')
        }).should.be.rejectedWith(store.RelationNotFoundError, {message: 'Can\'t find relation "unknown" for User'})
      })

      it('throws an error on unknown nested relation', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join({unknown: 'posts'})
        }).should.be.rejectedWith(store.RelationNotFoundError, {message: 'Can\'t find relation "unknown" for User'})
      })

      it('join returns the right sql', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join('posts').toSql(function(sql){
            sql.should.be.equal('select "users"."id" "f0", "users"."login" "f1", "users"."email" "f2", "users"."created_at" "f3", "posts"."id" "f4", "posts"."user_id" "f5", "posts"."thread_id" "f6", "posts"."message" "f7" from "users" inner join "posts" on "users"."id" = "posts"."user_id"')
          })
        })
      })


      it('leftJoin returns the right sql', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.leftJoin('posts').toSql(function(sql){
            sql.should.be.equal('select "users"."id" "f0", "users"."login" "f1", "users"."email" "f2", "users"."created_at" "f3", "posts"."id" "f4", "posts"."user_id" "f5", "posts"."thread_id" "f6", "posts"."message" "f7" from "users" left join "posts" on "users"."id" = "posts"."user_id"')
          })
        })
      })


      it('rightJoin returns the right sql', function(){
        if(title === 'SQL (SQLite3)') return Promise.resolve() // not supported for SQLite3
        return store.ready(function(){
          var User = store.Model('User')
          return User.rightJoin('posts').toSql(function(sql){
            sql.should.be.equal('select "users"."id" "f0", "users"."login" "f1", "users"."email" "f2", "users"."created_at" "f3", "posts"."id" "f4", "posts"."user_id" "f5", "posts"."thread_id" "f6", "posts"."message" "f7" from "users" right join "posts" on "users"."id" = "posts"."user_id"')
          })
        })
      })


      it('innerJoin returns the right sql', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.innerJoin('posts').toSql(function(sql){
            sql.should.be.equal('select "users"."id" "f0", "users"."login" "f1", "users"."email" "f2", "users"."created_at" "f3", "posts"."id" "f4", "posts"."user_id" "f5", "posts"."thread_id" "f6", "posts"."message" "f7" from "users" inner join "posts" on "users"."id" = "posts"."user_id"')
          })
        })
      })


      it('join returns the right sql (type=right)', function(){
        if(title === 'SQL (SQLite3)') return Promise.resolve() // not supported for SQLite3
        return store.ready(function(){
          var User = store.Model('User')
          return User.join('posts', 'right').toSql(function(sql){
            sql.should.be.equal('select "users"."id" "f0", "users"."login" "f1", "users"."email" "f2", "users"."created_at" "f3", "posts"."id" "f4", "posts"."user_id" "f5", "posts"."thread_id" "f6", "posts"."message" "f7" from "users" right join "posts" on "users"."id" = "posts"."user_id"')
          })
        })
      })


      it('join with a belongsTo relation', function(){
        return store.ready(function(){
          var Post = store.Model('Post')
          return Post.join('user').toSql(function(sql){
            sql.should.be.equal('select "posts"."id" "f0", "posts"."user_id" "f1", "posts"."thread_id" "f2", "posts"."message" "f3", "user"."id" "f4", "user"."login" "f5", "user"."email" "f6", "user"."created_at" "f7" from "posts" inner join "users" "user" on "posts"."user_id" = "user"."id"')
          })
        })
      })


      it('join returns the right sql (nested arrays)', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join([['posts']]).toSql(function(sql){
            sql.should.be.equal('select "users"."id" "f0", "users"."login" "f1", "users"."email" "f2", "users"."created_at" "f3", "posts"."id" "f4", "posts"."user_id" "f5", "posts"."thread_id" "f6", "posts"."message" "f7" from "users" inner join "posts" on "users"."id" = "posts"."user_id"')
          })
        })
      })


      it('returns the right results', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join('posts').order('users.id').exec(function(result){
            result[0].login.should.be.equal('phil')
            result[0].posts.length.should.be.equal(3)
            result[1].login.should.be.equal('michl')
            result[1].posts.length.should.be.equal(1)
            result[2].login.should.be.equal('marlene')
            result[2].posts.length.should.be.equal(1)
          })
        })
      })


      it('returns null values as well', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find(4).join('posts').exec(function(marlene){
            marlene.posts[0].attributes.should.have.property('message')
          })
        })
      })

      it('returns false values as well', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find(4).join('threads').exec(function(marlene){
            marlene.threads[0].attributes.should.have.property('archived')
            marlene.threads[0].archived.should.be.equal(false)
          })
        })
      })


      it('returns the right results on multiple joins', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join('posts', 'threads').order('users.id').exec(function(result){
            result[0].login.should.be.equal('phil')
            result[0].posts.length.should.be.equal(3)
            result[0].threads.length.should.be.equal(1)
            result[1].login.should.be.equal('michl')
            result[1].posts.length.should.be.equal(1)
            result[1].threads.length.should.be.equal(1)
            result[2].login.should.be.equal('marlene')
            result[2].posts.length.should.be.equal(1)
            result[2].threads.length.should.be.equal(1)
          })
        })
      })


      it('returns the right results on nested joins aaa', function(){
        return store.ready(function(){
          var Thread = store.Model('Thread')
          return Thread.join({posts: 'user'}).order('title').exec(function(result){
            result[0].title.should.be.equal('first thread')
            result[0].posts.length.should.be.equal(3)
            result[0].posts[0].user.login.should.be.equal('phil')
            result[0].posts[1].user.login.should.be.equal('phil')
            result[0].posts[2].user.login.should.be.equal('michl')
            result[1].title.should.be.equal('second thread')
            result[1].posts.length.should.be.equal(1)
            result[1].posts[0].user.login.should.be.equal('phil')
          })
        })
      })


      it('returns the right results on nested joins with the same table twice', function(){
        return store.ready(function(){
          var Thread = store.Model('Thread')
          return Thread.join({posts: 'user'}, 'user').order('title', 'user.id').exec(function(result){
            result[0].title.should.be.equal('first thread')
            result[0].posts.length.should.be.equal(3)
            result[0].posts[0].user.login.should.be.equal('phil')
            result[0].posts[1].user.login.should.be.equal('phil')
            result[0].posts[2].user.login.should.be.equal('michl')
            result[0].user.login.should.be.equal('michl')
            result[1].title.should.be.equal('second thread')
            result[1].posts.length.should.be.equal(1)
            result[1].posts[0].user.login.should.be.equal('phil')
            result[1].user.login.should.be.equal('phil')
          })
        })
      })


      it('returns the right results on nested joins with nested conditions', function(){
        return store.ready(function(){
          var Thread = store.Model('Thread')
          return Thread.join({posts: 'user'}, 'user').where({posts: {user: {login_like: 'phi'}}}, {title_like: 'first'}).order('title', 'user.id').exec(function(result){
            result[0].title.should.be.equal('first thread')
            result[0].posts.length.should.be.equal(2)
            result[0].posts[0].user.login.should.be.equal('phil')
            result[0].posts[1].user.login.should.be.equal('phil')
            result[0].user.login.should.be.equal('michl')
            should.not.exist(result[1])
          })
        })
      })


      it('returns the right results on multiple nested joins and nested conditions (attribute = attribute)', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join({threads: 'posts'}).where({threads: {posts: {id: {attribute: 'user_id'}}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(1)
            result[0].threads[0].posts[0].id.should.be.equal(result[0].threads[0].posts[0].user_id)
          })
        })
      })


      it('returns the right results on multiple nested joins and nested conditions (attribute = other_table.attribute)', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join({threads: 'posts'}).where({threads: {posts: {id: {attribute: 'id', relation: 'threads'}}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(1)
            result[0].threads[0].posts[0].id.should.be.equal(result[0].threads[0].posts[0].user_id)
          })
        })
      })


      it('returns the right results on deep nested joins with nested conditions', function(){
        return store.ready(function(){
          var Thread = store.Model('Thread')
          return Thread.join({posts: {user: 'posts'}}, 'user').where({posts: {user: {login_like: 'phi'}}}, {title_like: 'first'}).order('title', 'user.id').exec(function(result){
            result[0].title.should.be.equal('first thread')
            result[0].posts.length.should.be.equal(2)
            result[0].posts[0].user.login.should.be.equal('phil')
            result[0].posts[1].user.login.should.be.equal('phil')
            result[0].posts[0].user.posts.length.should.be.equal(3)
            result[0].user.login.should.be.equal('michl')
            should.not.exist(result[1])
          })
        })
      })

      it('returns the right results on deep nested joins with nested conditions (attribute = other_table.attribute)', function(){
        return store.ready(function(){
          var Thread = store.Model('Thread')
          return Thread.join({posts: {user: 'posts'}}, 'user').where({posts: {user: {posts: {user_id: {attribute: 'user_id', relation: 'posts'}}}}}).order('title', 'user.id').exec(function(result){
            result.length.should.be.equal(2)
            result[0].posts[0].user_id.should.be.equal(result[0].posts[0].user.posts[0].user_id)
          })
        })
      })


      it('returns the right results on hasOne relations', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join('avatar', 'left').exec(function(result){
            result.length.should.be.equal(4)
            result[0].avatar.url.should.be.equal('http://awesome-avatar.com/avatar.png')
            should.not.exist(result[1].avatar)
            should.not.exist(result[2].avatar)
            should.not.exist(result[3].avatar)
          })
        })
      })

      it('returns the right results on hasMany through', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.leftJoin('unread').order('users.id').exec(function(result){
            result.length.should.be.equal(4)
            result[0].unread.length.should.be.equal(1)
            result[1].unread.length.should.be.equal(0)
            result[2].unread.length.should.be.equal(0)
            result[3].unread.length.should.be.equal(0)
          })
        })
      })


      it('returns the right results on nested hasMany through', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.leftJoin('unread_threads').order('users.id').exec(function(result){
            result.length.should.be.equal(4)
            result[0].unread_threads.length.should.be.equal(1)
            result[0].unread_threads[0].title.should.be.equal('second thread')
            result[1].unread_threads.length.should.be.equal(0)
            result[2].unread_threads.length.should.be.equal(0)
            result[3].unread_threads.length.should.be.equal(0)
          })
        })
      })

      it('returns the right results on belongsTo through', function(){
        return store.ready(function(){
          var Post = store.Model('Post')
          return Post.join('thread_autor').order('posts.id').exec(function(result){
            result.length.should.be.equal(4)
            result[0].thread_autor.login.should.be.equal('michl')
            result[1].thread_autor.login.should.be.equal('michl')
            result[2].thread_autor.login.should.be.equal('phil')
            result[3].thread_autor.login.should.be.equal('michl')
          })
        })
      })


      it('returns the right results on sub nested hasMany through', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join({threads: {user: 'unread_threads'}}).order('users.id').exec(function(result){
            result.length.should.be.equal(1)
            result[0].unread_threads.length.should.be.equal(0)            
            result[0].threads.length.should.be.equal(1)            
            result[0].threads[0].user.unread_threads.length.should.be.equal(1)
          })
        })
      })


      it('returns the right results on sub nested hasMany through with conditions', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join({threads: {user: 'unread_threads'}}).where({threads: {user: {unread_threads: {title_like: 'second'}}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(1)
            result[0].unread_threads.length.should.be.equal(0)

            result[0].threads.length.should.be.equal(1)

            result[0].threads[0].user.unread_threads.length.should.be.equal(1)
          })
        })
      })


      it('throws an error on polymorphic join', function(){
        return store.ready(function(){
          var PolyThing = store.Model('PolyThing')
          return PolyThing.join('member')
        }).should.be.rejectedWith(Error, {message: 'Can\'t join polymorphic relations'}) // TODO: return custom error?!
      })

      it('returns a the polymorphic relation from the other side', function(){
        return store.ready(function(){
          var Avatar = store.Model('Avatar')
          return Avatar.find(1).join('poly_things').exec(function(result){
            result.id.should.be.equal(1)
            result.poly_things.length.should.be.equal(1)
            result.poly_things[0].member_type.should.be.equal('Avatar')
            result.poly_things[0].member_id.should.be.equal(result.id)
          })
        })
      })


      it('does only one join, even join(table) was called twice', function(){
        return store.ready(function(){
          var Avatar = store.Model('Avatar')
          return Avatar.find(1).join('poly_things').join('poly_things').exec(function(result){
            result.id.should.be.equal(1)
            result.poly_things.length.should.be.equal(1)
            result.poly_things[0].member_type.should.be.equal('Avatar')
            result.poly_things[0].member_id.should.be.equal(result.id)
          })
        })
      })



      it('join returns the right sql (custom join)', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join('JOIN posts ON posts.id = users.id').toSql(function(sql){
            sql.should.be.equal('select * from "users" JOIN posts ON posts.id = users.id')
          })
        })
      })

      it('join returns the right sql (custom join with args)', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.join(['JOIN posts ON posts.id = users.id AND posts.message LIKE ?', ['%foo%']]).toSql(function(sql){
            sql.should.be.equal('select * from "users" JOIN posts ON posts.id = users.id AND posts.message LIKE \'%foo%\'')
          })
        })
      })


      it('join with a belongsTo relation', function(){
        return store.ready(function(){
          var Post = store.Model('Post')
          return Post.join('user').toSql(function(sql){
            sql.should.be.equal('select "posts"."id" "f0", "posts"."user_id" "f1", "posts"."thread_id" "f2", "posts"."message" "f3", "user"."id" "f4", "user"."login" "f5", "user"."email" "f6", "user"."created_at" "f7" from "posts" inner join "users" "user" on "posts"."user_id" = "user"."id"')
          })
        })
      })
    })
  })
}
