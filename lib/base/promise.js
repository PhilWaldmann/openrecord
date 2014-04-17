var Promise = require('bluebird');

exports.model = exports.record = {  
  promise: function(resolver, resolve, reject){
    var promise = new Promise(resolver);
    
    promise.then(resolve, reject);
    
    return promise;
  }
}