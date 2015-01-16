var should = require('should');
var Store = require('../../../../lib/store');

module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Include (' + store_conf.url + ')', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
    
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
    });
    
    
    it('get child objects (one level)!', function(next){
      store.ready(function(){
        var Ou = store.Model('Ou');
        Ou.searchRoot('ou=openrecord,' + LDAP_BASE).include('children').exec(function(ous){
          ous.length.should.be.equal(1);
          ous[0].children.length.should.be.equal(4);
          ous[0].children[0].children.length.should.be.equal(0);
          next();
        });      
      });
    });
    
    it('get all recursive child objects!', function(next){
      store.ready(function(){
        var Ou = store.Model('Ou');
        Ou.searchRoot('ou=openrecord,' + LDAP_BASE).include('all_children').exec(function(ous){
          ous.length.should.be.equal(1);
          ous[0].all_children.length.should.not.be.equal(0);
          next();
        });      
      });
    });
    
  });
};