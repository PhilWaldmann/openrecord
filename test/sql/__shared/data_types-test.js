var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Data Types', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){});
    });
    
    
    
    describe('cast()', function(){
      it('casts BLOB to string', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.definition.cast('my_blob', 45454).should.be.equal('45454');      
          next();
        });      
      });
    
    
      it('casts INTEGER to number', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.definition.cast('my_integer', '123.55').should.be.equal(123);      
          next();
        });      
      });
    
    
    
      it('casts REAL to float', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.definition.cast('my_real', '123.55').should.be.equal(123.55);      
          next();
        });      
      });
    
    });
    
    
  });
};