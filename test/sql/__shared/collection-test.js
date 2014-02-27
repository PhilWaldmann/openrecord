var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Collection', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      
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
    
    
    
    it('create a relational record with relation.create()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).include('posts').exec(function(user){
          user.posts.length.should.be.equal(3);
          
          user.posts.create({thread_id:1, message: 'another post'}, function(success){
            success.should.be.true;
            this.id.should.be.equal(5);
            this.user_id.should.be.equal(user.id);
            next();
          });
        });
      });
    });
    
    it('create a relational record with relation.add()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(2).include('posts').exec(function(user){
          user.posts.length.should.be.equal(1);
          
          user.posts.add(Post.new({thread_id:1, message: 'yet another post'}));
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.count.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    
    it('create multiple relational records with relation.new()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(3).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0);
          
          user.posts.new({thread_id:1, message: 'michls post2'});
          user.posts.new({thread_id:1, message: 'post 3'});
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.count.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    
    it('create multiple relational records with relation = record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(4).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0);
          
          user.posts = Post.new({thread_id:1, message: 'with ='})
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.count.should.be.equal(1);
              next();
            });
          });
        });
      });
    });
    
    it('create multiple relational records with relation = record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(5).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0);
          
          user.posts = [Post.new({thread_id:1, message: 'with = [] 1'}), Post.new({thread_id:1, message: 'with = [] 2'})]
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.count.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    
    it('set a belongs_to record with =', function(next){ 
      store.ready(function(){
        var Thread = store.Model('Thread');
        var User = store.Model('User');
        Thread.find(1).exec(function(thread){
          
          thread.user = User.new({login:'new_user', email:'new_user@mail.com'});
          
          thread.save(function(success){
            success.should.be.true;

            User.where({login: 'new_user'}).include('threads').limit(1).exec(function(user){
              user.email.should.be.equal('new_user@mail.com');
              user.threads.length.should.be.equal(1);
              next();
            });
          });
        });
      });
    });
    
    
    
    it('load all related records', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(3).exec(function(user){
          user.threads.exec(function(threads){
            threads.length.should.be.equal(1);
            next();
          });
        });
      });
    });
    
  });
};