const Store = require('../../../lib/store')
const cache = require('../../fixtures/cache/mysql.json')

describe('MySQL: Cache', function(){
  var store
  var database = 'cache_test'


  function withoutChanged(attr){
    const a = Object.assign({}, attr)
    a.name = a.name.replace('_changed', '')
    return a
  }


  before(function(next){
    this.timeout(5000)
    beforeMYSQL(database, [
      'CREATE TABLE users(id serial primary key, login TEXT, email TEXT)',
      'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)'
    ], next)
  })

  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'mysql',
      database: database,
      user: 'travis',
      password: ''
    })

    store.Model('user', function(){})
    store.Model('post', function(){})

    store.setMaxListeners(0)
    store.on('exception', function(){})
  })

  after(function(next){
    afterMYSQL(database, next)
  })


  it('cache contains all models', function(next){
    store.ready(function(){
      store.cache.should.have.keys('user', 'post')
      next()
    })
  })

  it('cache contains model attributes', function(next){
    store.ready(function(){
      store.cache.user.should.have.keys('attributes')
      store.cache.post.should.have.keys('attributes')
      store.cache.user.attributes.should.have.size(3)
      store.cache.post.attributes.should.have.size(4)
      next()
    })
  })

  it('cache contains only necessary attribute information', function(next){
    store.ready(function(){
      store.cache.user.attributes.should.be.eql(cache.user.attributes.map(withoutChanged))
      store.cache.post.attributes.should.be.eql(cache.post.attributes.map(withoutChanged))
      next()
    })
  })


  describe('Load from cache file', function(){
    var store2
    before(function(){
      store2 = new Store({
        host: 'localhost',
        type: 'mysql',
        database: database,
        user: 'travis',
        password: '',
        cache: cache
      })
      store2.Model('user', function(){})
      store2.Model('post', function(){})

      store2.setMaxListeners(0)
      store2.on('exception', function(){})
    })


    it('model attributes are defined', function(next){
      store2.ready(function(){
        store2.Model('user').definition.attributes.should.have.keys('id', 'login_changed', 'email')
        store2.Model('post').definition.attributes.should.have.keys('id_changed', 'user_id', 'thread_id', 'message')
        next()
      })
    })
  })
})
