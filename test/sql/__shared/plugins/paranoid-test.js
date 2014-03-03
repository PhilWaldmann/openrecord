var should = require('should');
var Store = require('../../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Paranoid', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){
        this.paranoid();
      });
    });
    
    it('returns only records with deleted_at IS NULL', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where({login_not: 'hans'}).exec(function(records){
          records.length.should.be.equal(2);
          next();
        });
      });      
    });
    
    
    it('returns all records with with_deleted() scope', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where({login_not: 'hans'}).with_deleted().exec(function(records){
          records.length.should.be.equal(4);
          next();
        });
      });      
    });
    
    
    it('"deletes" a record', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find(5).exec(function(hans){
          hans.destroy(function(success){
            User.find(5).exec(function(del_hans){
              should.not.exist(del_hans);
              
              User.find(5).with_deleted().exec(function(existing_hans){
                existing_hans.login.should.be.equal('hans');
                should.exist(existing_hans.deleted_at);
                next();
              });
              
            });
          });          
        });
      });      
    });
    
  });
};