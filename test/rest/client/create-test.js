var should = require('should');
var Store = require('../../../lib/store');

describe('REST Client: Create', function(){
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
  
  
  
  it('creates a new record (create)', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.create({login: 'max', email: 'max@mail.com'}, function(success){
        success.should.be.true;
        should.exist(this.id);
        next();
      }, function(err){
        should.not.exist(err);
        next();
      });
    });      
  });
  
  
  
  it('creates nested records (create)', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      var user = User.new({login: 'hugo', email: 'hugo@mail.com'});
      
      user.posts.add({
        message: 'hugo post',
        thread_id: 3
      });
      
      user.save(function(success){
        success.should.be.true;
        
        User.find(this.id).include('posts').exec(function(user){

          user.posts.length.should.be.equal(1);
          user.posts[0].message.should.be.equal('hugo post');
          
          next();
        });
        
      });
    });      
  });
    
  
});