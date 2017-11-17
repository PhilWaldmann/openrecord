var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Data Types', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('User', function(){})
    })



    describe('cast()', function(){
      it('casts BLOB to string', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.definition.cast('my_blob', 45454, 'read').should.be.equal('45454')
          next()
        })
      })


      it('casts INTEGER to number', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.definition.cast('my_integer', '123.55', 'read').should.be.equal(123)
          next()
        })
      })



      it('casts REAL to float', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.definition.cast('my_real', '123.55', 'read').should.be.equal(123.55)
          next()
        })
      })
    })
  })
}
