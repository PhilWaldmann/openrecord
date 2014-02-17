var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Includes', function(){
    var store;
  
    before(beforeFn);
    after(afterFn);
  
  
    before(function(){
      store = new Store(store_conf);
      
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
    
      it('include does not join tables', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include('posts').toSql().should.be.equal('select * from "users"');
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
            result[0].login.should.be.equal('phil');
            result[0].posts.length.should.be.equal(0);
            result[0].threads.length.should.be.equal(0);
          
            result[1].login.should.be.equal('michl');
            result[1].posts.length.should.be.equal(0);
            result[1].threads.length.should.be.equal(1);
            result[1].threads[0].posts.length.should.be.equal(3);
            next();
          });
        });
      });
    
    
      it('Loads the user but no posts', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          //joins the threads table....
          User.include('posts').where({posts:{message_like:'unknown'}}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].posts.length.should.be.equal(0);
            result[1].posts.length.should.be.equal(0);
            result[2].posts.length.should.be.equal(0);
            next();
          });
        });
      });
    
    
      it('Loads the user and their threads but no posts', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          //joins the threads table....
          User.include({threads: 'posts'}).where({threads:{posts:{message_like:'unknown'}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].threads.length.should.be.equal(1);
            result[0].threads[0].posts.length.should.be.equal(0);
            result[1].threads.length.should.be.equal(1);
            result[1].threads[0].posts.length.should.be.equal(0);
            result[2].threads.length.should.be.equal(0);
            next();
          });
        });
      });
         
    });
    
    
  });
};