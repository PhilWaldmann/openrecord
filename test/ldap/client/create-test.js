var should = require('should');
var Store = require('../../../lib/store');

describe('LDAP Client: Create', function(){
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
      this.attribute('username', String);
      this.attribute('memberOf', Array);
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.hasMany('groups', {container: 'children', foreign_key:'member'});
    });
    
    store.Model('Group', function(){
      this.attribute('name', String);
      this.attribute('member', Array);
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.hasMany('members', {container: 'children', polymorph: true, type_key:'type', foreign_key:'memberOf'});
    });
    
    store.Model('Ou', function(){
      this.isContainer('ou');
      this.attribute('name', String);      
    });
  });
  
  
  
  it('creates a new record with a dn', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.create({dn:'cn=fifi, ou=create, dc=test', username: 'fifi', age: 35}, function(success){
        success.should.be.true;
        User.find('cn=fifi, ou=create, dc=test').exec(function(user){
          user.username.should.be.equal('fifi');
          next();
        });        
      }, function(err){
        should.not.exist(err);
        next();
      });
    });      
  });
  
  
  
  it('creates nested records', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      var User = store.Model('User');
      
      var ou = Ou.new({name: 'Sub', dn:'ou=sub, ou=create, dc=test'});
      
      ou.children.add(User.new({
        username: 'hugo',
        age: 44
      }));
      
      ou.save(function(success){
        success.should.be.true;
        
        Ou.find('ou=sub, ou=create, dc=test').include('children').exec(function(ou){

          ou.name.should.be.equal('Sub');
          ou.children.length.should.be.equal(1);
          ou.children[0].username.should.be.equal('hugo');
          
          next();
        });
        
      });
    });      
  });
    
  
});