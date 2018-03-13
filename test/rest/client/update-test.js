var Store = require('../../../lib/store')

describe('REST Client: Update', function(){
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


  it('updates a record (update)', function(){
    return store.ready(function(){
      var User = store.Model('User')
      return User.find(1).exec(function(record){
        record.id.should.be.equal(1)
        record.login = 'philipp'
        return record.save()
      })
    })
  })


  it('updates nested records (update)', function(){
    return store.ready(function(){
      var User = store.Model('User')
      return User.find(2).include('posts').exec(function(record){
        record.login.should.be.equal('michl')
        record.posts.length.should.be.equal(1)

        record.login = 'michael'
        record.posts[0].message = 'michaels post'

        return record.save()
        .then(function(){
          return User.find(2).include('posts').exec(function(record){
            record.login.should.be.equal('michael')
            record.posts.length.should.be.equal(1)
            record.posts[0].message.should.be.equal('michaels post')
          })
        })
      })
    })
  })
})
