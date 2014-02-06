var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Destroy', function(){
  var store;
  var db_file = __dirname + '/destroy_test.sqlite3';
  
  
  
  before(function(next){
    beforeSql(db_file, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
      'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
      'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
      'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
      'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
      'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
    ], next);
  });
  
  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: db_file
    });

    store.Model('User', function(){
      this.hasMany('posts');
      this.hasMany('threads');
      
      this.beforeDestroy(function(){
        this.save.should.be.a.Function;
        return this.login != 'max';
      });
      
      this.afterDestroy(function(){
        this.save.should.be.a.Function;
        return this.login != 'maxi';
      });
      
    });
    store.Model('Post', function(){
      this.belongsTo('user');
      this.belongsTo('thread');
      
      this.validatesPresenceOf('message');
    });
    store.Model('Thread', function(){
      this.belongsTo('user');
      this.hasMany('posts');
    });
        
  });
  
  after(function(){
    afterSql(db_file);
  });
  
  
  describe('beforeDestroy()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login = 'max';
          phil.destroy(function(result){
            result.should.be.false;
            next();
          });
        });      
      });
    });
  });
  
  describe('afterDestroy()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login = 'maxi';
          phil.destroy(function(result){
            result.should.be.false;
            
            User.find(1, function(phil){
              should.exist(phil);
              phil.login.should.be.equal('phil');
              next();
            }); 
            
          });
        });      
      });
    });
  });
  
  
  describe('destroy()', function(){
    
    it('destroy a single record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login.should.be.equal('phil');
          
          phil.destroy(function(result){
            result.should.be.equal(true);
            
            User.find(1, function(phil){
              should.not.exist(phil);
              next();
            });            
            
          });
          
        });  
      });
    });
    
             
  });
  
  
});