const Store = require('../../../store/oracle')
const cache = require('../../fixtures/cache/oracle.json')

if(process.env['ORACLE_HOME']){
  describe('Oracle: Cache', function(){
    var store
    var database = 'cache_test'


    function withoutChanged(attr){
      const a = Object.assign({}, attr)
      a.name = a.name.replace('_changed', '')
      return a
    }


    before(function(next){
      this.timeout(5000)
      beforeOracle(database, [
        'CREATE TABLE "users"("id" number(10), "login" TEXT, "email" TEXT)',
        'PRIMARY:users:id',
        'CREATE TABLE "posts"("id" number(10), "user_id" INTEGER, "thread_id" INTEGER, "message" TEXT)',
        'PRIMARY:posts:id'
      ], next)
    })

    before(function(){
      store = new Store(getOracleConfig(database))

      store.Model('user', function(){})
      store.Model('post', function(){})
    })

    after(function(next){
      afterOracle(database, next)
    })


    it('cache contains all models', function(){
      return store.ready(function(){
        store.cache.should.have.keys('user', 'post')
      })
    })

    it('cache contains model attributes', function(){
      return store.ready(function(){
        store.cache.user.should.have.keys('attributes')
        store.cache.post.should.have.keys('attributes')
        store.cache.user.attributes.should.have.size(3)
        store.cache.post.attributes.should.have.size(4)
      })
    })

    it('cache contains only necessary attribute information', function(){
      return store.ready(function(){
        store.cache.user.attributes.should.be.eql(cache.user.attributes.map(withoutChanged))
        store.cache.post.attributes.should.be.eql(cache.post.attributes.map(withoutChanged))
      })
    })


    describe('Load from cache file', function(){
      var store2
      before(function(){
        store2 = new Store(getOracleConfig(database, {cache: cache}))
        store2.Model('user', function(){})
        store2.Model('post', function(){})

        store2.setMaxListeners(0)
        store2.on('exception', function(){})
      })


      it('model attributes are defined', function(){
        return store2.ready(function(){
          store2.Model('user').definition.attributes.should.have.keys('id', 'login_changed', 'email')
          store2.Model('post').definition.attributes.should.have.keys('id_changed', 'user_id', 'thread_id', 'message')
        })
      })
    })


    describe('Disable autoload', function(){
      var store2
      before(function(){
        store2 = new Store(getOracleConfig(database, {disableAutoload: true}))
        store2.Model('user', function(){})
        store2.Model('post', function(){})

        store2.setMaxListeners(0)
        store2.on('exception', function(){})
      })


      it('model attributes are not defined', function(){
        return store2.ready(function(){
          store2.Model('user').definition.attributes.should.not.have.keys('id', 'login_changed', 'email')
          store2.Model('post').definition.attributes.should.not.have.keys('id_changed', 'user_id', 'thread_id', 'message')
        })
      })
    })
  })
}
