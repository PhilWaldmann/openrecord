try {
  const Fiber = require('fibers')

  exports.store = {
    sync: function(callback){
      Fiber(callback).run()
    }
  }


  exports.model = exports.record = {
    promise: function(resolver, resolve, reject){
      var store = this.definition.store
      var fiber = Fiber.current
      var promise = this.callParent(resolver, resolve, reject)

      if(fiber && !resolve && !reject){
        var gotResult = false

        promise.then(function(result){
          gotResult = true
          fiber.run(result)
        }).catch(function(err){
          if(!gotResult){
            fiber.throwInto(err)
          }else{
            store.handleException(err)
          }
        })

        return Fiber.yield()
      }else{
        return promise
      }
    }
  }
}catch(e){}
