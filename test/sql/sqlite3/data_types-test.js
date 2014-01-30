var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Data Types', function(){
  var store;
  var db_file = __dirname + '/data_types_test.sqlite3';
  
  
  
  before(function(next){
    beforeSql(db_file, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, my_blob BLOB, my_integer INTEGER, my_real REAL)',
    ], next);
  });
  
  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: db_file
    });

    store.Model('User', function(){});
  });
  
  after(function(){
    afterSql(db_file);
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