var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Includes', function(){
  var store;
  var db_file = __dirname + '/includes_test.sqlite3';
  
  
  
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
  
    
  
  
  describe('include()', function(){
    
    it('throws an error on unknown relation', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        (function(){
          User.include('unknown');
        }).should.throw();        
        next();
      });
    });
    
    it('throws an error on unknown nested relation', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        (function(){
          User.include({unknown: 'posts'})
        }).should.throw();        
        next();
      });
    });
    
    it('single include results in a sql join', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include('posts').toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" left join "posts" on "users"."id" = "posts"."user_id"');
        next();
      });
    });
    
    
    it('returns the right results on a simple include', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include('posts').order('users.id').exec(function(result){
          result[0].login.should.be.equal('phil');
          result[0].posts.length.should.be.equal(3);
          result[1].login.should.be.equal('michl');
          result[1].posts.length.should.be.equal(1);
          result[2].login.should.be.equal('admin');
          result[2].posts.length.should.be.equal(0);
          next();
        });
      });
    });
    
    
    it('returns the right results on multiple includes', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include('posts', 'threads').order('users.id').exec(function(result){
          result[0].login.should.be.equal('phil');
          result[0].posts.length.should.be.equal(3);
          result[0].threads.length.should.be.equal(1);
          result[1].login.should.be.equal('michl');
          result[1].posts.length.should.be.equal(1);
          result[1].threads.length.should.be.equal(1);
          result[2].login.should.be.equal('admin');
          result[2].posts.length.should.be.equal(0);
          result[2].threads.length.should.be.equal(0);
          next();
        });
      });
    });
    
    
    it('returns the right results on multiple nested includes', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include({threads: 'posts'}).order('users.id').exec(function(result){
          result[0].login.should.be.equal('phil');
          result[0].posts.length.should.be.equal(0);
          result[0].threads.length.should.be.equal(1);
          result[0].threads[0].posts.length.should.be.equal(1);
          result[1].login.should.be.equal('michl');
          result[1].posts.length.should.be.equal(0);
          result[1].threads.length.should.be.equal(1);
          result[1].threads[0].posts.length.should.be.equal(3);
          result[2].login.should.be.equal('admin');
          result[2].posts.length.should.be.equal(0);
          result[2].threads.length.should.be.equal(0);
          next();
        });
      });
    });
    
    
    it('returns the right results on deep nested includes', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include({threads: {posts:'user'}}).order('users.id').exec(function(result){
          result[0].login.should.be.equal('phil');
          result[0].posts.length.should.be.equal(0);
          result[0].threads.length.should.be.equal(1);
          result[0].threads[0].posts.length.should.be.equal(1);
          result[0].threads[0].posts[0].user.login.should.be.equal('phil');
          result[1].login.should.be.equal('michl');
          result[1].posts.length.should.be.equal(0);
          result[1].threads.length.should.be.equal(1);
          result[1].threads[0].posts.length.should.be.equal(3);
          result[2].login.should.be.equal('admin');
          result[2].posts.length.should.be.equal(0);
          result[2].threads.length.should.be.equal(0);
          next();
        });
      });
    });
    
    
    it('returns the right results on multiple nested includes and nested conditions', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        //joins the threads table....
        User.include({threads: 'posts'}).where({threads:{title_like:'first'}}).order('users.id').exec(function(result){
          result[0].login.should.be.equal('michl');
          result[0].posts.length.should.be.equal(0);
          result[0].threads.length.should.be.equal(1);
          result[0].threads[0].posts.length.should.be.equal(3);
          next();
        });
      });
    });
         
  });
  
  
});