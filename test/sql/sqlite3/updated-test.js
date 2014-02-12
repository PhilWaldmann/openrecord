var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Update', function(){
  var store;
  var database = __dirname + '/update_test.sqlite3';
  
  
  
  before(function(next){
    beforeSQLite(database, [
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
      file: database
    });

    store.Model('User', function(){
      this.hasMany('posts');
      this.hasMany('threads');
      
      this.beforeUpdate(function(){
        this.save.should.be.a.Function;
        return this.login != 'max';
      });
      
      this.beforeUpdate(function(){
        this.save.should.be.a.Function;
        return this.login != 'maxi';
      });
      
      this.beforeSave(function(){
        this.save.should.be.a.Function;
        return this.login != '_max';
      });
      
      this.afterSave(function(){
        this.save.should.be.a.Function;
        return this.login != '_maxi';
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
    afterSQLite(database);
  });
  
  
  describe('beforeUpdate()', function(){
    it('gets called', function(next){ 
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
  
  
  describe('afterUpdate()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login = 'maxi';
          phil.save(function(result){
            result.should.be.false;
            
            User.where({login:'maxi'}).count().exec(function(result){
              result.count.should.be.equal(0);
              next();
            });
            
          });
        });      
      });
    });
  });
  
   
  describe('beforeSave()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login = '_max';
          phil.save(function(result){
            result.should.be.false;
            next();
          });
        });      
      });
    });
  });
  
 
  describe('afterSave()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login = '_maxi';
          phil.save(function(result){
            result.should.be.false;
            
            User.where({login:'_maxi'}).count().exec(function(result){
              result.count.should.be.equal(0);
              next();
            });
            
          });
        });      
      });
    });
  });
  
  
  
  
  describe('update()', function(){
    
    it('updates a single record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1, function(phil){
          phil.login.should.be.equal('phil');
          
          phil.login = 'philipp';
          phil.save(function(result){
            result.should.be.equal(true);
            
            User.where({login:'philipp'}).limit(1).exec(function(philipp){
              philipp.login.should.be.equal('philipp');
              philipp.id.should.be.equal(phil.id);
              next();
            });            
            
          });
          
        });  
      });
    });
    
    
    it('updates a nested records', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(2).include('posts').exec(function(michl){
          michl.login.should.be.equal('michl');
          michl.posts.length.should.be.equal(1);
          michl.posts[0].message.should.be.equal('michls post');
          
          michl.login = 'michael';
          michl.posts[0].message = 'michaels post';
          
          michl.save(function(result){
            result.should.be.equal(true);
            
            User.where({login:'michael'}).include('posts').limit(1).exec(function(michael){
              michael.login.should.be.equal('michael');
              michael.id.should.be.equal(michl.id);
              michael.posts[0].message.should.be.equal('michaels post');
              michael.posts[0].id.should.be.equal(michl.posts[0].id);
              
              next();
            });            
            
          });
          
        });  
      });
    });
    
    
    
    
    
    it('updates a record and adds new nested records', function(next){ 
      store.ready(function(){
        var Thread = store.Model('Thread');
        Thread.find(1).include('posts').exec(function(thread){
          thread.title.should.be.equal('first thread');
          thread.posts.length.should.be.equal(3);
          
          thread.title = 'Phils first thread';
          thread.posts.add({user_id: 1, message:'another post'});
          thread.posts.add({user_id: 2, message:'one more'});
          
          thread.save(function(result){
            result.should.be.equal(true);
            
            Thread.find(1).include('posts').exec(function(michael){
              thread.title.should.be.equal('Phils first thread');
              thread.posts.length.should.be.equal(5);
              
              next();
            });            
            
          });
          
        });  
      });
    });
             
  });
  
  
});