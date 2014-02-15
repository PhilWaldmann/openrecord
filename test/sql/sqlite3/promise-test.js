var should = require('should');

var Store = require('../../../lib/store');
/*
describe('Promise', function(){
  var store;
  var db_file = __dirname + '/promise_test.sqlite3';
    
  
  before(function(next){
    beforeSql(db_file, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
      'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")'
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
  

  it('has then() function', function(next){ 
    store.ready(function(){
      var User = store.Model('User');
      User.find(1).then.should.be.a.Function
      next();
    });
  });
    

  it('works with success function', function(next){ 
    store.ready(function(){
      var User = store.Model('User');
      User.find(1).then(function(result){
        result.should.be.instanceof(User);
        next();
      });
    });
  });
  
});

*/