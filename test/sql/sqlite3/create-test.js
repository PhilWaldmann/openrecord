var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Create', function(){
  var store;
  var db_file = __dirname + '/create_test.sqlite3';
  
  
  
  before(function(next){
    beforeSql(db_file, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)'
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
  
  
  
  describe('create()', function(){

    it('writes a new record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'phil',
          email: 'phil@mail.com'
        }, function(result){
          result.should.be.equal(true);
          next();
        });  
      });
    });
         
  });
  
  
});