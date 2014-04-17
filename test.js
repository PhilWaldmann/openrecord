var Promise = require('bluebird');

var promise = new Promise(function(resolve, reject){
  setTimeout(function(){
    resolve({
      a:1,
      then: function(a, b){
        if(a.name == 'Promise$_resolveFromThenable') a(this);
      }
    });
  }, 1000);
});


promise.then(function(value){
  console.log('!1', value);
});

promise.then(function(value){
  console.log('!2', value);
});