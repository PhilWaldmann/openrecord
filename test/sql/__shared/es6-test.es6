var Store = require('../../../store')
var should = require('should')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': ES6++', function(){
    var store
    var User

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      // in order to run the same test on multiple databases
      // The `Post` class will be altered and will change the output of the folowing tests
      const OriginalPost = require('../../fixtures/classes/Post.es6')
      class Post extends OriginalPost{}

      storeConf.models = [
        Post
      ]
      store = new Store(storeConf)

      User = class User extends store.BaseModel{
        static definition(){
          this.hasMany('posts')
          this.hasMany('threads')          
          this.scope('michl')
        }

        recordMethod(){
          return this.login + '!!'
        }
      
        static modelMethod(){
          return 'model method!'
        }

        static michl(){
          this.where({login: 'michl'})
        }
      }

      class Thread extends Store.BaseModel{
        // to test an empty class, extended from Store constructor
      }

      store.Model('User', User)
      store.Model(Thread)
    })


    it('es6 class was loaded', async function(){
      await store.ready()      
      const Thread = store.Model('Thread')
      Thread.find.should.be.a.Function()
    })

    it('es6 class via model file was loaded', async function(){
      await store.ready()      
      const User = store.Model('User')
      User.find.should.be.a.Function()
    })

    it('es6 class has static method', async function(){
      await store.ready()      
      User.modelMethod.should.be.a.Function()
      User.modelMethod().should.be.equal('model method!')
    })


    it('all with `await`', async function(){
      await store.ready()      
      const users = await User
      
      users.length.should.be.equal(3)
    })

    it('include with `await`', async function(){
      await store.ready()      
      const users = await User.include('posts')
      
      users.length.should.be.equal(3)
      users[0].posts.length.should.be.equal(3)
      users[1].posts.length.should.be.equal(1)
    })


    it('es6 class instance has method', async function(){
      await store.ready()      
      const user = await User.find(1)
      user.id.should.be.equal(1)
      user.recordMethod.should.be.a.Function()
      user.recordMethod().should.be.equal('phil!!')
    })


    it('works with scopes', async function(){
      await store.ready()      
      const users = await User.michl()
      
      users.length.should.be.equal(1)
      users[0].login.should.be.equal('michl')
    })


    it('create with `await`', async function(){
      await store.ready()
      var User = store.Model('User')

      const user = await User.create({
        login: 'my_login',
        email: 'my_mail@mail.com'
      })
      user.id.should.not.be.equal(null)
    })

    it('works with class inheritance', async function(){
      await store.ready()
      var Post = store.Model('Post')
      
      const post = Post.new({
        user_id: 1
      })
      
      const valid = await post.isValid()
      valid.should.be.equal(false)      
    })


    it('destroy with `await`', async function(){
      await store.ready()
      const User = store.Model('User')
      let user = await User.find(2)

      await user.destroy()

      user = await User.find(2)
      should.not.exist(user)
    })


    it('parallel queries', async function(){
      await store.ready()
      const User = store.Model('User')
      const myContext = {}

      const query = User.setContext(myContext)
      const [users, totalCount] = await Promise.all([
        query.limit(2),
        query.clone().totalCount()
      ])

      users.length.should.be.equal(2)
      totalCount.should.be.equal(3)
    })



    it('bulk create', async function(){
      await store.ready()
      const User = store.Model('User')

      const users = await User.create([
        {login: 'user1'},
        {login: 'user2'},
        {login: 'user3'}
      ])

      users.length.should.be.equal(3)
      should.exist(users[0].id)
      should.exist(users[1].id)
      should.exist(users[2].id)
    })
  })
}