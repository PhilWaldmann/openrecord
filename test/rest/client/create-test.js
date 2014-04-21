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
    
  
});