var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Exec', function(){
    var store;
  
    before(beforeFn);
    after(afterFn);
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      store.on('exception', function(){});
      
      store.Model('User', function(){});
      store.Model('Stop', function(){
        this.beforeFind(function(){
          return false;
        })
      });
    });
    
    /* //async error?!?!
    it('throws an error on unknown table', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        (function(){
          User.where({login_like: 'phi'}).exec(function(){
            
          });
        }).should.throw();        
        next();
      });
    });
    */
    
    it('returns null', function(next){ 
      store.ready(function(){
        var Stop = store.Model('Stop');
        Stop.where({login_like: 'phi'}).exec(function(result){
          should.not.exists(result);
          next();
        });  
      });
    });
    
    
  });
};