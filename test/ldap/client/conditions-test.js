var should = require('should');

var Store = require('../../../lib/store');

describe('LDAP Client: Conditions', function(){
  var store;
  
  before(function(){
    store = new Store({
      type: 'ldap',
      url: 'ldap://0.0.0.0:1389',
      base: 'dc=test',
      username: 'cn=root',
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
    
  
  it('get all user objects with conditions', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.where({username:'phil'}).exec(function(users){
        users.length.should.be.equal(1);
        users[0].username.should.be.equal('phil');
        next();
      });      
    });
  });
  
  
  it('get all user objects with conditions', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.where({username_like:'ph'}).exec(function(users){
        users.length.should.be.equal(1);
        users[0].username.should.be.equal('phil');
        next();
      });      
    });
  });
});