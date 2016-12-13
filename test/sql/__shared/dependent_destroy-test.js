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
        this.hasMany('poly_things', {as:'member', dependent:'destroy'});
        this.beforeDestroy(function(){
          return this.id != 2;
        });
      });
      store.Model('Post', function(){
        this.belongsTo('user', {dependent:'destroy'});
        this.belongsTo('thread', {dependent:'destroy'});
        this.hasMany('poly_things', {as:'member', dependent:'destroy'});
        this.beforeDestroy(function(){
          return this.id != 1;
        });
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts', {dependent:'destroy', validates:false});
        this.hasMany('poly_things', {as:'member', dependent:'destroy'});
      });
      store.Model('PolyThing', function(){
        this.belongsTo('member', {polymorph: true});
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


    it('destroy belongsTo with failing relation destroy', function(next){
      store.ready(function(){
        var Thread = store.Model('Thread');
        var Post = store.Model('Post');

        Post.find(5, function(post){
          post.destroy(function(result){
            result.should.be.equal(false);
            next();
          });
        });
      });
    });



    it('destroy polymorph hasMany', function(next){
      store.ready(function(){
        var PolyThing = store.Model('PolyThing');
        var Post = store.Model('Post');

        Post.find(6, function(post){
          post.destroy(function(result){
            result.should.be.equal(true);

            PolyThing.find([1, 2], function(poly_things){
              poly_things.length.should.be.equal(1);
              next();
            });
          });
        });
      });
    });

  });
};
