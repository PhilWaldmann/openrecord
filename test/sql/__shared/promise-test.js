var should = require('should');

var Store = require('../../../lib/store');

module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Promise', function(){
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
        
    
    
    
    it('has then() function', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).then.should.be.a.Function
        next();
      });
    });
      
    
    it('returns select results', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).then(function(result){
          result.should.be.instanceof(User);
          next();
        });
      });
    });
    
    
    it('returns select results multiple times', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).then(function(result){
          result.should.be.instanceof(User);
        }).then(function(result){
          result.should.be.instanceof(User);
          next();
        });
      });
    });
    
    
    it('saves a record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).then(function(result){
          result.login = 'test';
          result.then(function(){
            next();
          });
        });
      });
    });
    
    it('destroys a record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(2).then(function(result){
          result.destroy().then(function(){
            next();
          });
        });
      });
    });
    
    it('destroys multiple records', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where({id_gt:2}).destroy().then(function(result){
          next();
        });
      });
    });
    
    it('calls onReject method on error', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where('foo=blaa').then(function(result){
          
        }, function(error){
          next();
        });
      });
    });
    
    
    it('calls onReject methods on error', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where('foo=blaa').then(function(result){
          
        }, function(error){
          
        }).then(null, function(){
          next();
        });
      });
    });
    
    
    it('calls catch method on error', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where('foo=blaa').catch(function(error){
          next();
        });
      });
    });
    
    
    it('calls catch with exec() first', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where('foo=blaa').exec(function(result){
          
        }).catch(function(error){
          next();
        });
      });
    });
    
    
    it('catches only SQLError', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where('foo=blaa').catch(Store.RecordNotFoundError, function(error){
          error.should.be.instanceOf(Store.RecordNotFoundError);
        }).catch('SQLError', function(error){
          error.should.be.instanceOf(Store.SQLError);
          next();
        });
      });
    });
    
    it('catches only Store.SQLError', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where('foo=blaa').catch(Store.RecordNotFoundError, function(error){
          error.should.be.instanceOf(Store.RecordNotFoundError);
        }).catch(Store.SQLError, function(error){
          error.should.be.instanceOf(Store.SQLError);
          next();
        });
      });
    });
    
    
  });
};
