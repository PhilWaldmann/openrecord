var Promise = require('bluebird/js/main/promise')();

exports.model = {
  
  exec: function(callback){
    return this.then().nodeify(callback);
  },
  
  then: function(onFulfilled, onRejected) {
    var self = this.chain();
    var promise = self.getInternal('promise');
    
    if (!promise) {
      promise = Promise.bind(this);
      promise = promise.then(function() {
        return self._find(promise);
      }).bind();
      self.setInternal('promise', promise);
    }
    return promise.then(onFulfilled, onRejected);
  },

  catch: function() {
    return this.caught.apply(this, arguments);
  },

  caught: function() {
    var promise = this.then();
    return promise.caught.apply(promise, arguments);
  },

  lastly: function() {
    var promise = this.then();
    return promise.lastly.apply(promise, arguments);
  },

  finally: function() {
    return this.lastly.apply(this, arguments);
  }
};
