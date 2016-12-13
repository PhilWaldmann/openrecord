try {
  var Fiber = require('fibers');

  exports.store = {
    sync: function(callback){
      Fiber(callback).run();
    }
  }


  exports.model = exports.record = {
    promise: function(resolver, resolve, reject){
      var store = this.definition.store;
      var fiber = Fiber.current;
      var promise = this.callParent(resolver, resolve, reject);

      if(fiber && !resolve && !reject){
        var got_result = false;

        promise.then(function(result){
          got_result = true;
          fiber.run(result);
        }).catch(function(err){
          if(!got_result){
            fiber.throwInto(err);
          }else{
            store.handleException(err);
          }
        });

        return Fiber.yield();
      }else{
        return promise;
      }
    }
  }


}catch(e){}
