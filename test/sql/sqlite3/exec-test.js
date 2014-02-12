var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Exec', function(){
  var store;
  var database = __dirname + '/exec_test.sqlite3';
  
  
  
  before(function(next){
    beforeSQLite(database, [], next);
  });
  
  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: database
    });

    store.Model('User', function(){});
    store.Model('Stop', function(){
      this.beforeFind(function(){
        return false;
      })
    });
    
  });
  
  after(function(){
    afterSQLite(database);
  });
  
  
  
  describe('exec()', function(){
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
  
  
});