var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Joins', function(){
  var store;
  var db_file = __dirname + '/validations_test.sqlite3';
  
  
  
  before(function(next){
    beforeSql(db_file, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',      
      'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
      'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, name TEXT, PRIMARY KEY(id, id2))',      
      'INSERT INTO multiple_keys(id, id2, name) VALUES(1, 1, "phil"), (1, 2, "michl"), (2, 1, "admin")'
    ], next);
  });
  
  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: db_file
    });

    store.Model('User', function(){
      this.validatesUniquenessOf('login', 'email');
      
      this.beforeValidation(function(){
        this.save.should.be.a.Function;
        return this.login != 'max';
      });
    });
    store.Model('MultipleKey', function(){
      this.validatesUniquenessOf('name');
    });
  });
  
  after(function(){
    afterSql(db_file);
  });
  
  
  describe('beforeValidation()', function(){
    it('gets called on create', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login:'max'
        }, function(result){
          result.should.be.false;
          next();
        });        
      });
    });
    
    
    it('gets called on update', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login = 'max';
          phil.save(function(result){
            result.should.be.false;
            next();
          });
        });      
      });
    });
  });
  
  
  
  describe('validatesUniquenessOf()', function(){
    
    it('returns false on duplicate entries (create)', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var phil2 = User.new({
          login:'phil'
        });
        
        phil2.isValid(function(valid){
          valid.should.be.false;
          next();
        });
        
      });
    });
    
    
    it('returns true on valid entry (create)', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var phil2 = User.new({
          login:'phil2'
        });
        
        phil2.isValid(function(valid){
          valid.should.be.true;
          next();
        });
        
      });
    });
    
    it('returns false on duplicate entries (update)', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var phil2 = User.new({
          id: 5,
          login:'phil'
        });
        
        phil2.isValid(function(valid){
          valid.should.be.false;
          next();
        });
        
      });
    });
    
    
    it('returns true on valid entry (update)', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var phil2 = User.new({
          id: 1,
          login:'phil'
        });
        
        phil2.isValid(function(valid){
          valid.should.be.true;
          next();
        });
        
      });
    });
     
     
    it('works with multiple primary_keys (create)', function(next){ 
      store.ready(function(){
        var MultipleKey = store.Model('MultipleKey');
        var phil = MultipleKey.new({
          id: 5,
          id2: 5,
          name:'phil'
        });
        
        phil.isValid(function(valid){
          valid.should.be.false;
          next();
        });
        
      });
    });
    
    
    it('works with multiple primary_keys (update)', function(next){ 
      store.ready(function(){
        var MultipleKey = store.Model('MultipleKey');
        var phil = MultipleKey.new({
          id: 1,
          id2: 1,
          name:'phil'
        });
        
        phil.isValid(function(valid){
          valid.should.be.true;
          next();
        });
        
      });
    });
     
  });
  
  
});