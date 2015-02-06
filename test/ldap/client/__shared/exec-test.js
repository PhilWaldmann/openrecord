var should = require('should');
var Store = require('../../../../lib/store');

module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Exec (' + store_conf.url + ')', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
    });
    
    
    it('get all ou objects of the base ou', function(next){
      store.ready(function(){
        var Ou = store.Model('Ou');
        Ou.searchRoot('ou=openrecord,' + LDAP_BASE).exec(function(ous){ 
          ous.length.should.be.equal(1);
          ous[0].name.should.be.equal('exec_test');
          next();
        });      
      });
    });
    
    
    it('get all ou objects of the base ou incl. child objects', function(next){
      store.ready(function(){
        var Ou = store.Model('Ou');
        Ou.searchRoot('ou=openrecord,' + LDAP_BASE, true).exec(function(ous){
          ous.length.should.be.equal(6);
          ous[0].name.should.be.equal('openrecord');
          next();
        });      
      });
    });
    
    it('get all ou objects of the base ou inkl. child objects (recursive)', function(next){
      store.ready(function(){
        var Ou = store.Model('Ou');
        Ou.searchRoot('ou=openrecord,' + LDAP_BASE).recursive().exec(function(ous){
          ous.length.should.be.equal(6);
          ous[0].name.should.be.equal('openrecord');
          next();
        });      
      });
    });
    
    
    it('get all user objects of base ou', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.searchRoot('ou=openrecord,' + LDAP_BASE).exec(function(users){
          users.length.should.be.equal(0);
          next();
        });      
      });
    });
    
    
    it('get all user objects of base ou incl. child objects', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.searchRoot('ou=openrecord,' + LDAP_BASE, true).exec(function(users){
          users.length.should.be.equal(6);
          next();
        });      
      });
    });


    it('get all user objects of one ou', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.searchRoot('ou=sub_ou1,ou=exec_test,ou=openrecord,' + LDAP_BASE).exec(function(users){
          users.length.should.be.equal(3);
          next();
        });      
      });
    });


    it('returns null on wrong searchRoot', function(next){ //TODO: this should instead throw an error - right?
      store.ready(function(){
        var User = store.Model('User');
        User.searchRoot('ou=unknown,ou=openrecord,' + LDAP_BASE).exec(function(users){
          should.not.exist(users)
          next();
        });      
      });
    });


  
    it('user object has standard attributes', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.searchRoot('ou=sub_ou3,ou=exec_test,ou=openrecord,' + LDAP_BASE).exec(function(users){

          var user = users[0];        
          user.dn.should.endWith(LDAP_BASE.toLowerCase());
          user.givenName.should.be.equal('first name');
          user.sn.should.be.equal('last name');
          user.sAMAccountName.should.be.equal('test_samaccountname');
          user.objectGUID.should.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{11}/);
          user.objectSid.should.match(/S-\d-\d-\d{2}-\d{10}-\d{9}-\d{8}-\d{3}/);
          user.attributes.whenChanged.should.be.instanceOf(Date); //will be handled internally as a date
          should.not.exist(user.attributes.accountExpires);
          user.objectClass.should.endWith('user');
          
          next();
        });      
      });
    });
      
  
    it('do a find on a not existing user object', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find('cn=unknown,ou=exec_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
          should.not.exist(user)
          next();
        });      
      });
    });
    
    
    
    it('do a find without null params returns null', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find(null).exec(function(user){
          should.not.exist(user)
          next();
        });      
      });
    });
    
    
  });
};