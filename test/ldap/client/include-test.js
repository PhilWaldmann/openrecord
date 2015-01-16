var should = require('should');

var Store = require('../../../lib/store');

describe('LDAP Client: Includes', function(){
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
      this.belongsToMany('groups', {ldap: 'memberOf'});
    });
    
    store.Model('Group', function(){
      this.attribute('name', String);
      this.attribute('member', Array);
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.belongsToMany('members', {polymorph: true, ldap: 'member'});
    });
    
    store.Model('Ou', function(){
      this.isContainer('ou'); //automatically creates `children` and `parent` relations
      
      this.hasMany('users', {ldap: 'children'});
      this.hasMany('groups', {ldap: 'children'});
      this.hasMany('group_members', {through:'groups', relation:'members'});
    });
  });
  
  
  it('includes a belongsTo relation', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.include('ou').exec(function(users){
        users.length.should.be.above(4);
        users[3].ou.objectClass.should.be.eql(['ou']);
        next();
      });      
    });
  });
  
  it('includes a belongsTo relations of one specific object', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.find('cn=susi, ou=others, dc=test').include('ou').exec(function(user){
        user.username.should.be.equal('susi');
        user.ou.objectClass.should.be.eql(['ou']);
        next();
      });      
    });
  });
  
  
  it('includes a parent container', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      Ou.find('ou=guests, ou=others, dc=test').include('parent').exec(function(ou){
        ou.dn.should.be.equal('ou=guests,ou=others,dc=test');
        ou.parent.objectClass.should.be.eql(['ou']);
        next();
      });      
    });
  });
  
  
  it('includes all child objects', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      Ou.find('ou=others, dc=test').include('children').exec(function(ou){
        ou.dn.should.be.equal('ou=others,dc=test');
        ou.children.length.should.be.equal(3);
        ou.children[0].username.should.be.equal('susi');
        next();
      });      
    });
  });
  
  
  
  it('includes a hasMany relation', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      Ou.recursive(false).include('users').exec(function(ous){
        ous.length.should.be.equal(4);
        ous[0].dn.should.be.equal('ou=others,dc=test');
        ous[0].users.length.should.be.equal(2);
        next();
      });      
    });
  });
  
  
  it('includes a hasMany relation without results', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      Ou.recursive(false).include('groups').exec(function(ous){
        ous.length.should.be.equal(4);
        ous[0].groups.length.should.be.equal(0);
        next();
      });      
    });
  });
  
  
  it('includes group members', function(next){
    store.ready(function(){
      var Group = store.Model('Group');
      Group.include('members').exec(function(groups){
        groups.length.should.be.equal(1);
        groups[0].members.length.should.be.equal(2);
        groups[0].members[0].username.should.be.equal('christian');
        next();
      });      
    });
  });
  
  it('includes all groups of users', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.include('groups').exec(function(users){
        users.length.should.be.above(5);
        users[4].groups.length.should.be.equal(1);
        users[5].groups.length.should.be.equal(1);
        next();
      });      
    });
  });
  
  
  it('includes all members of ou groups', function(next){
    store.ready(function(){
      var Ou = store.Model('Ou');
      Ou.include('group_members').exec(function(ous){
        ous.length.should.be.above(2);
        ous[2].group_members.length.should.be.equal(2);
        next();
      });      
    });
  });
    
});