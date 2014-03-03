var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': AutoJoin', function(){
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
        this.autoJoin();
      });
    });
    

  
    describe('autoJoin()', function(){

      it('returns the right results on nested joins with nested conditions', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.where({posts:{user:{login_like:'phi'}}}, {title_like: 'first'}).order('title', 'posts_user.id').exec(function(result){          
            result[0].title.should.be.equal('first thread');
            result[0].posts.length.should.be.equal(2);
            result[0].posts[0].user.login.should.be.equal('phil');
            result[0].posts[1].user.login.should.be.equal('phil');
            should.not.exist(result[1]);
            next();
          });
        });
      });
              
    });

  });
};