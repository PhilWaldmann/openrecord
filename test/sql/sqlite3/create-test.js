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
    });
    store.Model('Post', function(){
      this.belongsTo('user');
      this.belongsTo('thread');
    });
    store.Model('Thread', function(){
      this.belongsTo('user');
      this.hasMany('posts');
    });
        
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
         
  });
  
  
});