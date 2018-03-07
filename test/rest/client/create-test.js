var should = require('should')
var Store = require('../../../lib/store')

describe('REST Client: Create', function(){
  var store

  before(function(){
    store = new Store({
      type: 'rest',
      url: 'http://localhost:8889',
      version: '~1.0',
      autoSave: true
    })

    store.Model('User', function(){
      this.attribute('id', Number, {primary: true})
      this.attribute('login', String)
      this.attribute('email', String)

      this.hasMany('posts')
    })

    store.Model('Post', function(){
      this.attribute('id', Number, {primary: true})
      this.attribute('message', String)
      this.attribute('user_id', Number)
      this.attribute('thread_id', Number)

      this.belongsTo('user')
    })
  })



  it('creates a new record (create)', function(){
    return store.ready(function(){
      var User = store.Model('User')

      return User.create({login: 'max', email: 'max@mail.com'})
      .then(function(user){
        should.exist(user.id)
      })
    })
  })



  it('creates nested records (create)', function(){
    return store.ready(function(){
      var User = store.Model('User')

      var user = User.new({login: 'hugo', email: 'hugo@mail.com'})

      user.posts.add({
        message: 'hugo post',
        thread_id: 3
      })

      return user.save(function(user){
        return User.find(user.id).include('posts').exec(function(user){
          user.posts.length.should.be.equal(1)
          user.posts[0].message.should.be.equal('hugo post')
        })
      })
    })
  })
})
