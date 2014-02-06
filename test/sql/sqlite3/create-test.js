var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Create', function(){
  var store;
  var db_file = __dirname + '/create_test.sqlite3';
  
  
  
  before(function(next){
    beforeSql(db_file, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
      'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
      'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)'
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
      
      this.beforeCreate(function(){
        this.save.should.be.a.Function;
        return this.login != 'max';
      });
      
      this.afterCreate(function(){
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
    afterSql(db_file);
  });
  
  
  
  describe('beforeCreate()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'max'
        }, function(result){
          result.should.be.false;
          next();
        });      
      });
    });
  });
  
  
  describe('afterCreate()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'maxi'
        }, function(result){
          result.should.be.false;
          
          User.where({login:'maxi'}).count().exec(function(result){
            result.count.should.be.equal(0);
            next();
          });
          
        });      
      });
    });
  });
  
  
  describe('beforeSave()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: '_max'
        }, function(result){
          result.should.be.false;
          next();
        });      
      });
    });
  });
  
  
  describe('afterSave()', function(){
    it('gets called', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: '_maxi'
        }, function(result){
          result.should.be.false;
          
          User.where({login:'_maxi'}).count().exec(function(result){
            result.count.should.be.equal(0);
            next();
          });
          
        });      
      });
    });
  });
  
  
  
  describe('create()', function(){
    
    it('has the right context', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        
        User.create({
          login: 'my_login',
          email: 'my_mail@mail.com'
        }, function(result){
          this.login.should.be.equal('my_login');
          result.should.be.true;
          next();
        });  
      });
    });
    
    
    it('writes a new record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'phil',
          email: 'phil@mail.com'
        }, function(result){
          result.should.be.equal(true);
          User.where({login:'phil'}).count().exec(function(result){
            result.count.should.be.equal(1);
            next();
          });
          
        });  
      });
    });
    
    
    it('writes a new record with subrecords', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'michl',
          email: 'michl@mail.com',
          threads:[{
            title: 'Thread one'
          },{
            title: 'Thread two'
          }]
        }, function(result){
          result.should.be.equal(true);
          
          User.where({login:'michl'}).include('threads').limit(1).exec(function(result){
            result.login.should.be.equal('michl');
            result.threads.length.should.be.equal(2);
            next();
          });
          
        });  
      });
    });
    
    
    it('writes a new record with nested subrecords', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'admin',
          email: 'admin@mail.com',
          threads:[{
            title: 'Thread one',
            posts:[{
              message: 'Blubb'
            },{
              message: 'another'
            }]
          },{
            title: 'Thread two'
          }]
        }, function(result){
          result.should.be.equal(true);
          
          User.where({login:'admin'}).include({threads:'posts'}).limit(1).exec(function(result){
            result.login.should.be.equal('admin');
            result.threads.length.should.be.equal(2);
            result.threads[0].posts.length.should.be.equal(2);
            next();
          });
          
        });  
      });
    });
    
    
    it('does not write on validation errors', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'max',
          email: 'max@mail.com',
          threads:[{
            title: 'Thread one',
            posts:[{
              message: 'Blubb'
            },{
              message: null
            }]
          },{
            title: 'Thread two'
          }]
        }, function(result){
          result.should.be.equal(false);
                  
          User.where({login:'max'}).include({threads:'posts'}).limit(1).exec(function(result){
            should.not.exist(result);
            next();
          });
          
        });  
      });
    });
         
  });
  
  
});