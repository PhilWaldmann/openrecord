var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Empty', function(){
    var store;
  
    before(beforeFn);
    after(afterFn);
  
  
    before(function(){
      store = new Store(store_conf);
      //Models here
    });
    
    //Tests here
    
    
  });
};