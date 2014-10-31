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
      this.objectClassAttribute = 'type';
      this.belongsTo('ou');
    });
    
    store.Model('Ou', function(){
      this.objectClassAttribute = 'type';
      this.rdnPrefix('ou');
      this.hasMany('children', {polymorph: true});
      this.hasMany('users');
    });
  });
  
  
  it('include a belongsTO relations', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.include('ou').exec(function(users){
        console.log(users);
        users.length.should.be.equal(4);
        next();
      });      
    });
  });
  
    
});