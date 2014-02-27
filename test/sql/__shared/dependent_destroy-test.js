var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Destroy dependent', function(){
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
        this.belongsTo('thread', {dependent:'destroy'});
        this.beforeDestroy(function(){
          return this.id != 1;
        });
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts', {dependent:'destroy'});
      });
      
    });
    
  
    it('destroy hasMany', function(next){ 
      store.ready(function(){
        var Thread = store.Model('Thread');
        var Post = store.Model('Post');
        
        Thread.find(1, function(thread){   
          thread.destroy(function(result){
            result.should.be.equal(true);
            
            Post.find([1, 2], function(posts){
              posts.length.should.be.equal(1);
              posts[0].id.should.be.equal(1);
              next();
            });
          });                 
        });          
      });
    });
    
    
    it('destroy belongsTo', function(next){ 
      store.ready(function(){
        var Thread = store.Model('Thread');
        var Post = store.Model('Post');
        
        Post.find(3, function(post){   
          post.destroy(function(result){
            result.should.be.equal(true);
            
            Thread.find(2, function(thread){
              should.not.exist(thread);
              next();
            });
          });                 
        });          
      });
    });
        
    
  });
};