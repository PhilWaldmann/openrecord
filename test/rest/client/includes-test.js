var should = require('should');
var Store = require('../../../lib/store');

describe('REST Client: Include', function(){
  var store;

  before(function(){
    store = new Store({
      type: 'rest',
      url: 'http://localhost:8889',
      version: '~1.0'
    });

    store.Model('User', function(){
      this.attribute('id', Number, {primary: true});
      this.attribute('login', String);
      this.attribute('email', String);

      this.hasMany('posts');
    });

    store.Model('Post', function(){
      this.attribute('id', Number, {primary: true});
      this.attribute('message', String);
      this.attribute('user_id', Number);
      this.attribute('thread_id', Number);

      this.belongsTo('user');
    });
  });



  it('includes a hasMany relation', function(next){
    store.ready(function(){
      var User = store.Model('User');

      User.include('posts').exec(function(results){
        results.length.should.be.above(3);
        results[0].posts.length.should.be.equal(3);
        results[1].posts.length.should.be.equal(1);
        results[2].posts.length.should.be.equal(0);

        next();
      }, function(err){
        should.not.exist(err);
        next();
      });
    });
  });


  it('includes a belongsTo relation', function(next){
    store.ready(function(){
      var Post = store.Model('Post');

      Post.include('user').exec(function(results){
        results.length.should.be.equal(5);
        results[0].user.id.should.be.equal(1);
        results[1].user.id.should.be.equal(1);
        results[2].user.id.should.be.equal(1);
        results[3].user.id.should.be.equal(2);

        next();
      }, function(err){
        should.not.exist(err);
        next();
      });
    });
  });

});
