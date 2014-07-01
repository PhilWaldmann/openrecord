var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Destroy', function(){
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
        this.beforeDestroy(function(){
          return this.title != 'do not destroy';
        });
      });
      
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
    
    
      it('has the right scope', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(2, function(michl){
            michl.login.should.be.equal('michl');
          
            michl.destroy(function(result){
              result.should.be.equal(true);
              michl.should.be.equal(this);
              next();
            });
          
          });  
        });
      });
      
    });
    
    
    
    
    describe('deleteAll()', function(){
      it('delets all records without calling beforeDestroy or afterDestroy', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.where({title_like: 'delete'}).deleteAll(function(success){
            success.should.be.equal(true);
          
            Thread.where({title_like: 'delete'}).count().exec(function(result){
              result.should.be.equal(0);
              next();
            });
          
          });
        });
      });
      
      
      it('delets all records of a relation', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          var Post = store.Model('Post');
          
          Thread.find(1, function(thread){
            should.exist(thread);
                        
            thread.posts.deleteAll(function(success){
              success.should.be.equal(true);
              
              Post.where({thread_id:thread.id}).count().exec(function(result){
                result.should.be.equal(0);
                next();
              });
              
            });
          
          });
        });
      });
    });
    
    
    describe('destroyAll()', function(){
      it('delets all records with calling beforeDestroy or afterDestroy', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');

          Thread.where({title_like: 'destroy'}).destroyAll(function(success){
            success.should.be.equal(false);
          
            Thread.where({title_like: 'destroy'}).count().exec(function(result){
              result.should.be.equal(1);
              next();
            });
          
          });
        });
      });
    });

    
  });
};