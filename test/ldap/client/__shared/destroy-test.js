var should = require('should');
var Store = require('../../../../lib/store');

module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Destroy (' + store_conf.url + ')', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
    
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
    });
    
    
    
    
    describe('OU', function(){
      
      it('destroys an ou', function(next){
        store.ready(function(){
          var Ou = store.Model('Ou');
          Ou.find('ou=destroy_me_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
                
            ou.destroy(function(success){
              success.should.be.equal(true);
              
              Ou.find('ou=destroy_me_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
                should.not.exist(ou);
                next()
              });
            });
        
          });
        });
      });
      
      
      
      it('returns an error on ou destroys with children', function(next){
        store.ready(function(){
          var Ou = store.Model('Ou');
          Ou.find('ou=destroy_me_sub_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
                
            ou.destroy(function(success){
              success.should.be.equal(false);
              ou.errors.should.be.eql({base:['contains children']});
              next();
            });
        
          });
        });
      });
      
      
      it('destroys ou with all children', function(next){
        store.ready(function(){
          var Ou = store.Model('Ou');
          Ou.find('ou=destroy_me_sub_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
                
            ou.destroyAll(function(success){
              success.should.be.equal(true);
              
              Ou.find('ou=destroy_test,ou=openrecord,' + LDAP_BASE).include('ous').exec(function(ou){
                ou.ous.length.should.be.equal(0);
                next();
              });
            });        
          });
        });
      });
      
    });
    
    
    
    
    
    
    
    describe('Group', function(){
      
      it('destroys a group', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          Group.find('cn=destroy_me_group,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
                
            group.destroy(function(success){
              success.should.be.equal(true);
              
              Group.find('cn=destroy_me_group,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
                should.not.exist(group);
                next()
              });
            });
        
          });
        });
      });
      
    });
    
    
    
    
    
    
    describe('Computer', function(){
      
      it('destroys a computer', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          Computer.find('cn=destroy_me_computer,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
                
            computer.destroy(function(success){
              success.should.be.equal(true);
              
              Computer.find('cn=destroy_me_computer,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
                should.not.exist(computer);
                next()
              });
            });
        
          });
        });
      });
      
    });
    
    
    
    
    
    
    describe('User', function(){
      
      it('destroys a user', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find('cn=destroy_me_user,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
                
            user.destroy(function(success){
              success.should.be.equal(true);
              
              User.find('cn=destroy_me_user,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
                should.not.exist(user);
                next()
              });
            });
        
          });
        });
      });
      
    });
        
  });
};