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


      store.Model('User', function(){
        this.serialize('config')
      })
    })

    it('saves serialized data', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.create({
          login: 'phil',
          config: {
            some: {
              nested: ['data']
            }
          }
        })
      })
    })

    it('reads serialized data', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).exec(function(phil){
          phil.config.should.be.eql({
            some: {
              nested: ['data']
            }
          })
        })
      })
    })
  })
}
