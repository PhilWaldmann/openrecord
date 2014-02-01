var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Joins', function(){
  var store;
  var db_file = __dirname + '/exec_test.sqlite3';
  
  
  
  before(function(next){
    beforeSql(db_file, [], next);
  });
  
  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: db_file
    });

    store.Model('User', function(){});
    store.Model('Stop', function(){
      this.beforeFind(function(){
        return false;
      })
    });
    
  });
  
  after(function(){
    afterSql(db_file);
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
          should.not.exists(null);
          next();
        });  
      });
    });



         
  });
  
  
});