var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': AutoLoad', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(Object.assign({
        autoLoad: true
      }, storeConf))

      store.Model('Avatar', function(){
        this.scope('test', function(){

        })
      })
    })


    it('Models are loaded', function(){      
      return store.ready(function(){
        store.models.should.have.keys('user', 'post', 'thread', 'avatar', 'unreadpost', 'polything')
      })
    })

    it('Model attributes are loaded', function(){
      return store.ready(function(){
        store.models.user.definition.attributes.should.have.keys('id', 'login', 'email', 'created_at')
      })
    })

    it('Custom overwrites work', function(){
      return store.ready(function(){
        store.models.avatar.test.should.be.a.Function()
      })
    })
  })
}
