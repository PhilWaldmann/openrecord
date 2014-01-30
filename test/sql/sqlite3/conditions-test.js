var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Conditions', function(){
  var store;
  var db_file = __dirname + '/conditions_test.sqlite3';
  
  
  
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
  
    
  
  
  describe('find()', function(){
    
    it('finds with one id returns the right sql', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).toSql().should.be.equal('select * from "users" where "users"."id" = 1 limit 1 offset 0');
        next();
      });
    });
    
    
    it('finds phil with id 1', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).exec(function(result){
          result.login.should.be.equal('phil');
          next();
        });
      });      
    });
    
    it('finds phil with id 1 (without exec)', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(result){
          result.login.should.be.equal('phil');
          next();
        });
      });      
    });
    
    
    it('finds with multiple ids returns the right sql', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find([1, 2]).toSql().should.be.equal('select * from "users" where "users"."id" in (1, 2)');
        next();
      });
    });
    
    
    it('finds phil and michl by id', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find([1, 2]).exec(function(result){
          result.length.should.be.equal(2);
          result[0].login.should.be.equal('phil');
          result[1].login.should.be.equal('michl');
          next();
        });
      });      
    });
    
    
    it('finds phil and michl by id with reverse order', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find([1, 2]).order('id', true).exec(function(result){
          result.length.should.be.equal(2);
          result[0].login.should.be.equal('michl');
          result[1].login.should.be.equal('phil');
          next();
        });
      });      
    });
        
  });
  
  
  
  
  describe('where()', function(){
    
    it('where with like returns the right sql', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.where({login_like: 'phi'}).toSql().should.be.equal('select * from "users" where "users"."login" like \'%phi%\'');
        next();
      });
    });
    
    
    it('finds phil with like', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where({login_like: 'ph'}).exec(function(result){
          result[0].login.should.be.equal('phil');
          next();
        });
      });      
    });
    
    it('finds phil with like (without exec)', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where({login_like: 'ph'}, function(result){
          result[0].login.should.be.equal('phil');
          next();
        });
      });      
    }); 
    
    
    
    it('finds phil with array condition', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where(['login = ?', 'phil']).exec(function(result){
          result[0].login.should.be.equal('phil');
          next();
        });
      });      
    });
    
    
    it('finds NOT michl and admin', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where({login_not: ['michl', 'admin']}).exec(function(result){
          result[0].login.should.be.equal('phil');
          next();
        });
      });      
    });
    
    
    it('finds michl and admin with like', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where({login_like: ['mich', 'adm']}).order('login').exec(function(result){
          result[0].login.should.be.equal('admin');
          result[1].login.should.be.equal('michl');
          next();
        });
      });      
    });
    
            
  });
  
  
});