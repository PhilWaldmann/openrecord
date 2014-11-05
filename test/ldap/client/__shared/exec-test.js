var should = require('should');
var Store = require('../../../../lib/store');

module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Aggregate Functions', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);

      store.Model('User', function(){
        this.isUser();
      });
    
      store.Model('Ou', function(){
        this.isOragnizationalUnit();
      });
    });
    
    
    it('get all ou objects', function(next){
      store.ready(function(){
        var Ou = store.Model('Ou');
        Ou.searchRoot('ou=openrecord, dc=dabeach, dc=lan').exec(function(ous){ //use the config...
          ous.length.should.be.equal(2);
          next();
        });      
      });
    });
    
    
    it.skip('get all user objects', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.searchRoot('ou=openrecord, dc=dabeach, dc=lan').exec(function(users){
          console.log(users);
          users.length.should.be.equal(1);
          next();
        });      
      });
    });
  
    it.skip('user object has standard attributes', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.recursive(false).exec(function(users){
          var user = users[0];
        
          user.dn.should.endWith('dc=test');
          user.type.should.be.equal('user');
        
          next();
        });      
      });
    });
    
    it.skip('get all user objects!', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.exec(function(users){
          users.length.should.be.above(4);
          next();
        });      
      });
    });
  
    it.skip('get all user objects of another ou', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.searchRoot('ou=others, dc=test').exec(function(users){
          users.length.should.be.equal(2);
          next();
        });      
      });
    });
  
    it.skip('do a find on a not existing user object', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find('ou=others, dc=test').exec(function(user){
          should.not.exist(user)
          next();
        });      
      });
    });
    
    
  });
};