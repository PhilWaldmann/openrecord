var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Group', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    }); 
    
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('Post', function(){        
        
      });
    });
  
    
    it('group one field without select', function(done){
      store.ready(function(){
        var Post = store.Model('Post');
        
        Post.group('message').order('message').exec(function(posts){
          posts.should.be.eql([{
            message: 'first'
          },{
            message: 'second'
          },{
            message: 'third'
          }]);
          done();
        });
      });
    });
    
    
    it('group two field without select', function(done){
      store.ready(function(){
        var Post = store.Model('Post');
        
        Post.group('thread_id', 'message').order('message', 'thread_id').exec(function(posts){
          posts.should.be.eql([
            { thread_id: 1, message: 'first' },
            { thread_id: 2, message: 'first' },
            { thread_id: 1, message: 'second' },
            { thread_id: 2, message: 'third' } 
          ]);
          done();
        });
      });
    });
    
    
    it('group with select', function(done){
      store.ready(function(){
        var Post = store.Model('Post');
        
        Post.group('message').select('message', 'COUNT(*) as count').order('message').exec(function(posts){
          posts.should.be.eql([
            { message: 'first', count: 2},
            { message: 'second', count: 1},
            { message: 'third', count: 1} 
          ]);
          done();
        });
      });
    });
    
    it('group with raw having', function(done){
      store.ready(function(){
        var Post = store.Model('Post');
        
        Post.group('message').select('message', 'COUNT(*) as count').having('COUNT(*) > ?', 1).order('message').exec(function(posts){
          posts.should.be.eql([
            { message: 'first', count: 2}
          ]);
          done();
        });
      });
    });
    
    it('group with hash having', function(done){
      store.ready(function(){
        var Post = store.Model('Post');
        
        Post.group('message', 'thread_id').select('message', 'COUNT(*) as count').having({thread_id_gt: 1}).order('message').exec(function(posts){

          posts.should.be.eql([
            { message: 'first', count: 1 },
            { message: 'third', count: 1 }
          ]);
          done();
        });
      });
    });
          
  });
    
}  