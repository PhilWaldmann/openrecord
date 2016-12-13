var Promise = require('bluebird');

exports.store = {
  mixinCallback: function(){
    var self = this;
    Promise.onPossiblyUnhandledRejection(function(error){
      self.handleException(error);
    });
  }
}


exports.model = exports.record = {
  promise: function(resolver, resolve, reject){
    var promise = new Promise(resolver).bind(this);

    if(typeof resolve === 'function' && typeof reject !== 'function'){
      return promise.then(resolve);
    }

    if(typeof resolve === 'function' || typeof reject === 'function'){
      promise.then(resolve, reject);
    }

    return promise;
  },


  catch: function(type, callback){
    return this.exec().catch(type, callback);
  },


  all: function(array){
    return Promise.all(array);
  }
}
