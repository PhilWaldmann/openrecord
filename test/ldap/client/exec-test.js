var should = require('should');

var Store = require('../../../lib/store');

describe('LDAP Client: Exec', function(){
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
      
    });
  });
  
  
  it('get all user objects', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.exec(function(users){
        console.log(users);
        next();
      });      
    });
  });
    
});