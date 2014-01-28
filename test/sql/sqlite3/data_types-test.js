var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Data Types', function(){
  var store = new Store({
    type: 'sqlite3',
    file: __dirname + '/database.sqlite' 
  });
  
  store.Model('User', function(){
    this.attribute('my_blob', 'BLOB');
    this.attribute('my_integer', 'INTEGER');
    this.attribute('my_real', 'REAL');
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