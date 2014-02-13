var Promise = require('bluebird/js/main/promise')();

var A = function(){
  this.name = 'phil';
};

A.prototype.then = function(success, fail){
  var self = this;
  var promise = Promise.try(function(a){
    return self.foo();
  });
  
  promise.bind(this).then(success, fail);
    
  return promise;
}

A.prototype.exec = function(callback){
  return this.then(callback);
};

A.prototype.foo = function(){
  var self = this;
  return new Promise(function(callback,  err){
    setTimeout(function(){
      callback('blaa');
    }, 1000);
  }).bind(this);  
};


var a = new A();

a.exec(function(result){
  console.log('SUCCESS',  result, this);
}).catch(function(e){
  console.log('CATCH!!', e);
});