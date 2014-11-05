var should = require('should');

var Store = require('../../../lib/store');

describe('LDAP Client: Exec', function(){
  var store;
  
  before(function(){
    store = new Store({
      type: 'ldap',
      url: 'ldap://0.0.0.0:1389',
      base: 'dc=test',
      user: 'cn=root',
      password: 'secret'
    });
  
    store.Model('User', function(){
      this.objectClassAttribute = 'type';
      this.attribute('username');
    });
    
    store.Model('Ou', function(){
      this.objectClassAttribute = 'type';
      this.rdnPrefix('ou');
    });
  });
  
  
  it('get all user objects of the root ou', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.recursive(false).exec(function(users){
        users.length.should.be.equal(2);
        next();
      });      
    });
  });
  
  it('user object has standard attributes', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.recursive(false).exec(function(users){
        var user = users[0];
        
        user.dn.should.endWith('dc=test');
        user.type.should.be.equal('user');
        
        next();
      });      
    });
  });
    
  it('get all user objects!', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.exec(function(users){
        users.length.should.be.above(4);
        next();
      });      
    });
  });
  
  it('get all user objects of another ou', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.searchRoot('ou=others, dc=test').exec(function(users){
        users.length.should.be.equal(2);
        next();
      });      
    });
  });
  
  it('do a find on a not existing user object', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.find('ou=others, dc=test').exec(function(user){
        should.not.exist(user)
        next();
      });      
    });
  });
  
});