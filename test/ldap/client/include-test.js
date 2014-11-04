var should = require('should');

var Store = require('../../../lib/store');

describe('LDAP Client: Includes', function(){
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
      this.attribute('username', String);
      
      this.belongsTo('ou', {container: 'parent'});
    });
    
    store.Model('Ou', function(){
      this.objectClassAttribute = 'type';
      this.isContainer('ou'); //automatically creates `children` and `parent` relations
      
      this.hasMany('users');
    });
  });
  
  
  it('includes a belongsTo relations', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.recursive().include('ou').exec(function(users){
        users.length.should.be.equal(4);
        users[3].ou.type.should.be.equal('ou');
        next();
      });      
    });
  });
  
  it('includes a belongsTo relations of one specific object', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.searchRoot('cn=susi, ou=others, dc=test').searchScope('base').include('ou').exec(function(user){
        user.username.should.be.equal('susi');
        user.ou.type.should.be.equal('ou');
        next();
      });      
    });
  });
  
  
  it('includes a parent container', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      Ou.searchScope('base').searchRoot('ou=guests, ou=others, dc=test').include('parent').exec(function(ou){
        ou.dn.should.be.equal('ou=guests, ou=others, dc=test');
        ou.parent.type.should.be.equal('ou');
        next();
      });      
    });
  });
  
  
  it('includes all child objects', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      Ou.searchScope('base').searchRoot('ou=others, dc=test').include('children').exec(function(ou){
        ou.dn.should.be.equal('ou=others, dc=test');
        ou.children.length.should.be.equal(3);
        next();
      });      
    });
  });
    
});