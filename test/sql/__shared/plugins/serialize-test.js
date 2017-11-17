var Store = require('../../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Serialize', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('User', function(){
        this.serialize('config')
      })
    })

    it('saves serialized data', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.create({
          login: 'phil',
          config: {
            some: {
              nested: ['data']
            }
          }
        }, function(success){
          success.should.be.equal(true)
          next()
        })
      })
    })

    it('reads serialized data', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find(1).exec(function(phil){
          phil.config.should.be.eql({
            some: {
              nested: ['data']
            }
          })
          next()
        })
      })
    })
  })
}
