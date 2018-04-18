const should = require('should')
const Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Collection', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      storeConf.autoSave = true
      store = new Store(storeConf)



      store.Model('User', function(){
        this.hasMany('posts')
        this.hasMany('threads')
        this.hasOne('avatar')
        this.hasMany('unread_posts', {dependent: 'delete'})
        this.hasMany('unread', {through: 'unread_posts'})
        this.hasMany('unread_threads', {through: 'unread', relation: 'thread'})
        this.hasMany('poly_things', {as: 'member'})
      })
      store.Model('Avatar', function(){
        this.belongsTo('user')
      })
      store.Model('Post', function(){
        this.belongsTo('user')
        this.belongsTo('thread')
        this.belongsTo('thread_autor', {through: 'thread', relation: 'user'})
        this.hasMany('poly_things', {as: 'member'})
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts')
        this.hasMany('poly_things', {as: 'member'})
      })
      store.Model('UnreadPost', function(){
        this.belongsTo('user')
        this.belongsTo('unread', {model: 'Post'})
      })
      store.Model('PolyThing', function(){
        this.belongsToPolymorphic('member')
      })
    })



    it('create a relational record with relation.create()', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).include('posts').exec(function(user){
          user._posts.length.should.be.equal(3)

          return user.posts.create({thread_id: 1, message: 'another post'})
          .then(function(post){
            post.id.should.be.equal(5)
            post.user_id.should.be.equal(user.id)
          })
        })
      })
    })

    it('create a relational record with relation.add(Post.new())', function(){
      return store
      .ready(function(){
        var User = store.Model('User')
        var Post = store.Model('Post')
        return User.find(2).include('posts')
        .then(function(user){
          user.posts.length.should.be.equal(1)

          user.posts.add(Post.new({thread_id: 1, message: 'yet another post'}))

          return user.save()
        })
        .then(function(user){
          return Post.where({user_id: user.id}).count()
        })
        .then(function(result){
          result.should.be.equal(2)
        })
      })
    })

    it('create a relational record with relation.add({})', function(){
      return store
      .ready(function(){
        var User = store.Model('User')
        var Post = store.Model('Post')
        return User.find(2).include('posts')
        .then(function(user){
          user.posts.length.should.be.equal(2)

          user.posts.add({thread_id: 1, message: 'yet another post without new'})

          return user.save()
        })
        .then(function(user){
          return Post.where({user_id: user.id}).count()
        })
        .then(function(result){
          result.should.be.equal(3)
        })
      })
    })


    it('create multiple relational records with relation.new()', function(){
      return store.ready(function(){
        var User = store.Model('User')
        var Post = store.Model('Post')
        return User.find(3).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0)

          user.posts.new({thread_id: 1, message: 'michls post2'})
          user.posts.new({thread_id: 1, message: 'post 3'})

          return user.save()
          .then(function(){
            return Post.where({user_id: user.id}).count().exec(function(result){
              result.should.be.equal(2)
            })
          })
        })
      })
    })


    it('create a relational record with relation = record', function(){
      return store.ready(function(){
        var User = store.Model('User')
        var Post = store.Model('Post')
        return User.find(4).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0)

          user.posts = Post.new({thread_id: 1, message: 'with ='})

          return user.save()
          .then(function(){
            return Post.where({user_id: user.id}).count().exec(function(result){              
              result.should.be.equal(1)
            })
          })
        })
      })
    })

    it('create multiple relational records with relation = [records]', function(){
      return store.ready(function(){
        var User = store.Model('User')
        var Post = store.Model('Post')
        return User.find(5).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0)

          user.posts = [
            Post.new({thread_id: 1, message: 'with = [] 1'}),
            Post.new({thread_id: 1, message: 'with = [] 2'})
          ]

          return user.save()
          .then(function(){
            return Post.where({user_id: user.id}).count().exec(function(result){
              result.should.be.equal(2)
            })
          })
        })
      })
    })


    it('set a belongsTo record with = record', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        var User = store.Model('User')
        return Thread.find(1).exec(function(thread){
          thread.user = User.new({login: 'new_user', email: 'new_user@mail.com'})

          return thread.save()
          .then(function(){            
            return User.where({login: 'new_user'}).include('threads').first().exec(function(user){              
              user.email.should.be.equal('new_user@mail.com')
              user.threads.length.should.be.equal(1)
            })
          })
        })
      })
    })

    it('set a belongsTo record with = id', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        return Thread.find(1).exec(function(thread){
          thread.user_id = 2

          return thread.user
          .then(function(user){            
            user.id.should.be.equal(2)
          })
        })
      })
    })

    it('manually load a belongsTo relation', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        return Thread.find(1)
        .then(function(thread){ 
          return thread.user
        })
        .then(function(user){
          user.login.should.be.equal('new_user')
        })
      })
    })

    it('removes a belongsTo record with = null', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        return Thread.find(1).exec(function(thread){
          thread.user = null

          return thread.save()
          .then(function(){            
            return Thread.find(1).include('user')
          })
          .then(function(thread){
            should.not.exist(thread._user)
          })
        })
      })
    })


    it('set a hasOne record with =', function(){
      return store.ready(function(){
        var User = store.Model('User')
        var Avatar = store.Model('Avatar')
        return User.find(1).exec(function(user){
          user.avatar = Avatar.new({url: 'http://better-avatar.com/strong.png'})
          return user.save()
          .then(function(){
            return Avatar.where({url_like: 'better'}).include('user').first().exec(function(avatar){
              avatar.url.should.be.equal('http://better-avatar.com/strong.png')
              avatar._user.id.should.be.equal(user.id)
            })
          })
        })
      })
    })


    it('manually load a hasOne relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1)
        .then(function(user){ 
          return user.avatar
        })
        .then(function(avatar){
          avatar.url.should.be.equal('http://better-avatar.com/strong.png')
        })
      })
    })


    it('remove a hasOne record with = null', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).exec(function(user){
          user.avatar = null          
          return user.save()
          .then(function(){
            return User.find(1).include('avatar')
          })
          .then(function(user){
            should.not.exist(user._avatar)
          })
        })
      })
    })


    it('add multiple records on a hasMany through relation via add(1, 2)', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).exec(function(user){
          user.unread.add([1, 2])          
          return user.save()
          .then(function(){            
            return User.find(1).include('unread').exec(function(phil){              
              phil._unread.length.should.be.equal(3)
            })
          })
        })
      })
    })


    it('add a records on a hasMany through relation via new()', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(2).include('unread').exec(function(user){
          user.unread.length.should.be.equal(0)

          user.unread.new({thread_id: 3, user_id: 3, message: 'unread message'})

          return user.save()
          .then(function(){
            return User.find(2).include('unread').exec(function(michl){
              michl.unread.length.should.be.equal(1)
              user.unread[0].attributes.user_id.should.be.equal(3)
              user.unread[0].attributes.thread_id.should.be.equal(3)
              user.unread[0].attributes.message.should.be.equal('unread message')
            })
          })
        })
      })
    })


    it('add multiple records on a hasMany through relation via unread_ids = [1, 2]', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(4).exec(function(user){
          user.unread_ids = [1, 2]         

          return user.save()
          .then(function(){
            return User.find(4).include('unread').exec(function(user){
              user.unread.length.should.be.equal(2)
              user.unread[0].message.should.be.equal('first message')
            })
          })
        })
      })
    })

    it('manually load a hasMany through relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(4)
        .then(function(user){
          return user.unread
        })
        .then(function(unread){
          unread.length.should.be.equal(2)
          unread[0].message.should.be.equal('first message')
        })
      })
    })

    it('manually load the count() of a hasMany through relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(4)
        .then(function(user){          
          return user.unread.count()
        })
        .then(function(count){          
          count.should.be.equal(2)
        })
      })
    })

    it('clone a hasMany through relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(4)
        .then(function(user){          
          return Promise.all([
            user.unread,
            user.unread.clone().count(),
            user.unread.clone().limit(1)
          ])
        })
        .then(function(result){          
          result[0].length.should.be.equal(2)
          result[0][0].message.should.be.equal('first message')

          result[1].should.be.equal(2)

          result[2].length.should.be.equal(1)
          result[2][0].message.should.be.equal('first message')
        })
      })
    })

    it('remove a record from a hasMany through relation via unread_ids = [2]', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(4).exec(function(user){
          user.unread_ids = [2]         

          return user.save()
          .then(function(){
            return User.find(4).include('unread').exec(function(user){
              user.unread.length.should.be.equal(1)
            })
          })
        })
      })
    })

    it('creates a new record with subrecords defined with unread_ids=[]', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.create({
          login: 'A',
          email: 'A@mail.com',
          unread_ids: [2, 3, 4]
        })
        .then(function(result){
          return User.where({login: 'A'}).include('unread').first().exec(function(result){
            result.login.should.be.equal('A')
            result.unread.length.should.be.equal(3)
          })
        })
      })
    })



    it('updates a record`s hasMany relation with thread_ids=[1, 2]', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).include('threads').exec(function(user){ 
                 
          user.thread_ids = [1, 2]
          
          return user.save()
          .then(function(){
            return User.find(1).include('threads').exec(function(phil){
              phil.threads.length.should.be.equal(2)
            })
          })
        })
      })
    })


    it('updates a record`s hasMany relation with thread_ids=[1] if the relation is not loaded!', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).exec(function(user){ 
                 
          user.thread_ids = [1]
          
          return user.save()
          .then(function(){
            return User.find(1).include('threads').exec(function(phil){
              phil.threads.length.should.be.equal(1)
            })
          })
        })
      })
    })
    
    it('updates a record`s hasMany relation with thread=[1, 2]', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).exec(function(user){ 
                 
          user.threads = [1, 2]
          
          return user.save()
          .then(function(){
            return User.find(1).include('threads').exec(function(phil){
              phil.threads.length.should.be.equal(2)
            })
          })
        })
      })
    })

    it('manually load a hasMany relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1)
        .then(function(user){ 
          return user.threads
        })
        .then(function(threads){
          threads.length.should.be.equal(2)
        })
      })
    })

    it('manually load the count() of a hasMany relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1)
        .then(function(user){ 
          return user.threads.count()
        })
        .then(function(count){
          count.should.be.equal(2)
        })
      })
    })

    
    it('clone a hasMany relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1)
        .then(function(user){ 
          return Promise.all([
            user.threads.order('id', true),
            user.threads.clone().count(),
            user.threads.clone().limit(1).order('id')
          ])
        })
        .then(function(result){          
          result[0].length.should.be.equal(2)
          result[0][0].title.should.be.equal('second thread')

          result[1].should.be.equal(2)

          result[2].length.should.be.equal(1)
          result[2][0].title.should.be.equal('first thread')
        })
      })
    })


    it('removes a record`s hasMany related records', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).include('threads').exec(function(user){ 
                 
          user.thread_ids = [2]
          
          return user.save()
          .then(function(){
            return User.find(1).include('threads').exec(function(phil){
              phil.threads.length.should.be.equal(1)
            })
          })
        })
      })
    })


    it('load all related records via exec()', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(3).exec(function(user){
          return user.threads.exec(function(threads){
            threads.length.should.be.equal(1)
          })
        })
      })
    })


    it('load all related records via then()', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(3)
        .then(function(user){
          return user.threads
        })
        .then(function(threads){          
          threads.length.should.be.equal(1)
        })
      })
    })




    it('adds a polymorphic record', function(){
      return store.ready(function(){
        var User = store.Model('User')

        return User.find(1).exec(function(user){
          user.poly_things.new({message: 'foo'})

          return user.save()
          .then(function(){
            return User.find(1).include('poly_things').exec(function(phil){
              phil.poly_things.length.should.be.equal(1)
              phil.poly_things[0].message.should.be.eql('foo')
            })
          })
        })
      })
    })


    it('adds a record to a polymorphic relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        var PolyThing = store.Model('PolyThing')

        return PolyThing.find(1).exec(function(poly){
          poly.member = User.new({login: 'phil2'})
          return poly.save()
        })
        .then(function(){
          return PolyThing.find(1)
        })
        .then(function(poly){
          poly.member_id.should.be.equal(8)
          poly.member_type.should.be.equal('User')
          return poly.member
        })
        .then(function(member){
          member.id.should.be.equal(8)
          member.login.should.be.equal('phil2')
        })
      })
    })


    it('manually load a polymorphic relation', function(){
      return store.ready(function(){
        var PolyThing = store.Model('PolyThing')

        return PolyThing.find(1).exec(function(poly){
          return poly.member
        })
        .then(function(member){
          member.login.should.be.equal('phil2')
        })
      })
    })


    it('removes a record from a polymorphic relation', function(){
      return store.ready(function(){
        var PolyThing = store.Model('PolyThing')

        return PolyThing.find(1).exec(function(poly){
          poly.member = null
          return poly.save()
        })
        .then(function(){
          return PolyThing.find(1).include('member')
        })
        .then(function(poly){
          should.not.exist(poly.member_id)
          should.not.exist(poly.member_type)
          should.not.exist(poly._member)    
        })
      })
    })
  })
}
