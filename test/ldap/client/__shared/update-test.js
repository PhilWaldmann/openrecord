var should = require('should');
var Store = require('../../../../lib/store');

module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Update (' + store_conf.url + ')', function(){
    var store, target_ou;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
    
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      target_ou = 'ou=move_target,ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase();
    });
    
    
    describe('OU', function(){
            
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var Ou = store.Model('Ou');
          Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            
            ou.parent_dn = 'ou=somewhere,' + LDAP_BASE;
            
            ou.save(function(success){
              success.should.be.equal(false);
              ou.errors.should.be.eql({ parent_dn: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      
      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var Ou = store.Model('Ou');
          Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            
            ou.name = 'cn=foooo';
            
            ou.save(function(success){
              success.should.be.equal(false);
              ou.errors.should.be.eql({ name: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      
      it('moves an ou to another parent', function(next){
        store.ready(function(){
          var Ou = store.Model('Ou');
          Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
                        
            ou.parent_dn = target_ou
            
            ou.save(function(success){
              success.should.be.equal(true);
          
              Ou.find(ou.dn).exec(function(ou){
            
                ou.name.should.be.equal('move_me_ou');
                ou.parent_dn.should.be.equal(target_ou);
          
                next();
              });
            });
            
          });
        });
      });
      
      
      it('renames an ou', function(next){
        store.ready(function(){
          var Ou = store.Model('Ou');
          Ou.find('ou=rename_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
                        
            ou.name = 'new_name';
            
            ou.save(function(success){
              
              success.should.be.equal(true);
          
              Ou.find(ou.dn).exec(function(ou){
                
                ou.name.should.be.equal('new_name');
                ou.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
          
                next();
              });
            });
            
          });
        });
      });
      
      
    });
    
    
    
    
    
    
    describe('Group', function(){
      
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          Group.find('cn=move_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            
            group.parent_dn = 'ou=somewhere,' + LDAP_BASE;
            
            group.save(function(success){
              success.should.be.equal(false);
              group.errors.should.be.eql({ parent_dn: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          Group.find('cn=rename_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            
            group.name = 'cn=foooo';
            
            group.save(function(success){
              success.should.be.equal(false);
              group.errors.should.be.eql({ name: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      
      it('moves an group to another parent', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          Group.find('cn=move_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
                        
            group.parent_dn = target_ou
            
            group.save(function(success){
              success.should.be.equal(true);
          
              Group.find(group.dn).exec(function(group){
            
                group.name.should.be.equal('move_me_group');
                group.parent_dn.should.be.equal(target_ou);
          
                next();
              });
            });
            
          });
        });
      });
      
      
      it('renames a group', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          Group.find('cn=rename_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
                        
            group.name = 'new_group_name';
            
            group.save(function(success){
              success.should.be.equal(true);
          
              Group.find(group.dn).exec(function(group){
                
                group.name.should.be.equal('new_group_name');
                group.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
          
                next();
              });
            });
            
          });
        });
      });
      
    });
    
    
    
    
    
    
    describe('Computer', function(){
      
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          Computer.find('cn=move_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            
            computer.parent_dn = 'ou=somewhere,' + LDAP_BASE;
            
            computer.save(function(success){
              success.should.be.equal(false);
              computer.errors.should.be.eql({ parent_dn: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      
      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          Computer.find('cn=rename_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            
            computer.name = 'cn=foooo';
            
            computer.save(function(success){
              success.should.be.equal(false);
              computer.errors.should.be.eql({ name: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      
      it('moves an computer to another parent', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          Computer.find('cn=move_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
                        
            computer.parent_dn = target_ou
            
            computer.save(function(success){
              success.should.be.equal(true);
          
              Computer.find(computer.dn).exec(function(computer){
            
                computer.name.should.be.equal('move_me_computer');
                computer.parent_dn.should.be.equal(target_ou);
          
                next();
              });
            });
            
          });
        });
      });
      
      
      it('renames a computer', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          Computer.find('cn=rename_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
                        
            computer.name = 'new_computer_name';
            
            computer.save(function(success){
              success.should.be.equal(true);
          
              Computer.find(computer.dn).exec(function(computer){
                
                computer.name.should.be.equal('new_computer_name');
                computer.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
          
                next();
              });
            });
            
          });
        });
      });      
      
    });
    
        
    
    
    
    
    describe('User', function(){
      
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find('cn=move_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){

            user.parent_dn = 'ou=somewhere,' + LDAP_BASE;
            
            user.save(function(success){
              success.should.be.equal(false);
              user.errors.should.be.eql({ parent_dn: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      
      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find('cn=rename_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){

            user.name = 'cn=fooooo';
            
            user.save(function(success){
              success.should.be.equal(false);
              user.errors.should.be.eql({ name: [ 'not valid' ] });
              next()
            });
            
          });
        });
      });
      
      
      
      it('moves an user to another parent', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find('cn=move_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
                        
            user.parent_dn = target_ou
            
            user.save(function(success){
              success.should.be.equal(true);
          
              User.find(user.dn).exec(function(user){
            
                user.name.should.be.equal('move_me_user');
                user.parent_dn.should.be.equal(target_ou);
          
                next();
              });
            });
            
          });
        });
      });
      
      
      it('renames a user', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find('cn=rename_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
                        
            user.name = 'new_user_name';
            
            user.save(function(success){
              success.should.be.equal(true);
          
              User.find(user.dn).exec(function(user){
                
                user.name.should.be.equal('new_user_name');
                user.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
          
                next();
              });
            });
            
          });
        });
      });
      
    });
        
  });
};