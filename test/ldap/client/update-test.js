var should = require('should');
var Store = require('../../../lib/store');

describe('LDAP Client: Update', function(){
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
  
  
  
  it('updates a records attributes', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.find('cn=change_me, ou=update, dc=test').exec(function(user){
        user.username.should.be.equal('change_me');
        
        user.username = 'changed!';
        
        user.save(function(result){
          result.should.be.equal(true);
          
          User.find('cn=change_me, ou=update, dc=test').exec(function(user){
            user.username.should.be.equal('changed!');
            next();            
          });
          
        });
        
      });
      
    });      
  });
  
  
  
  it('moves a record', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.find('cn=move_me, ou=update, dc=test').exec(function(user){
        user.username.should.be.equal('move_me');
        user.dn = 'cn=move_me, ou=target, ou=update, dc=test';
        
        user.save(function(result){
          result.should.be.equal(true);
          
          User.find('cn=move_me, ou=update, dc=test').exec(function(user){
            should.not.exist(user);
            
            User.find('cn=move_me, ou=target, ou=update, dc=test').exec(function(user){
              
              user.username.should.be.equal('move_me');            
              next();
            });       
          });
          
        });
      });
    });      
  });
    
    
  it('moves and updates a record', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.find('cn=move_and_update_me, ou=update, dc=test').exec(function(user){
        user.username.should.be.equal('move_and_update_me');
        
        user.dn = 'cn=move_and_update_me, ou=target, ou=update, dc=test';
        user.username = 'moved...';
        
        user.save(function(result){
          result.should.be.equal(true);
          
          User.find('cn=move_and_update_me, ou=update, dc=test').exec(function(user){
            should.not.exist(user);
            
            User.find('cn=move_and_update_me, ou=target, ou=update, dc=test').exec(function(user){
              user.username.should.be.equal('moved...');
            
              next();
            });       
          });
          
        });
      });
    });      
  });
  
});