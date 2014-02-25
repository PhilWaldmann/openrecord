var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Attributes', function(){
    var store;
  
    before(beforeFn);
    after(afterFn);
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      store.on('exception', function(){});
      
      store.Model('User', function(){});
      store.Model('MultipleKey', function(){});

      store.Model('UnknownTable', function(){});
    });

    
    
    it('has the right primary_key', function(done){
      store.ready(function(){    
        var User = store.Model('User');

        var primary_keys = User.definition.primary_keys;
        primary_keys.should.be.eql(['id']);
    
        done();
      });
    });
  
    it('has multiple primary_keys', function(done){
      store.ready(function(){    
        var MultipleKey = store.Model('MultipleKey');

        var primary_keys = MultipleKey.definition.primary_keys;
        primary_keys.should.be.eql(['id', 'id2']);
    
        done();
      });
    });
  
  
    it('has NOT NULL attributes', function(done){
      store.ready(function(){    
        var User = store.Model('User');

        var attributes = User.definition.attributes;
        attributes.login.notnull.should.be.true;
    
        done();
      });
    });
  
  
    it('has automatic validation', function(done){
      store.ready(function(){    
        var User = store.Model('User');
        var phil = User.new();
      
        phil.isValid(function(valid){
          valid.should.be.false;
          phil.errors.should.have.property('login');
          done();
        });    
      
      });
    });
  
  
    it('loaded record to not have any changes', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).exec(function(result){
          should.exist(result);
          result.hasChanges().should.be.false;
          result.login.should.be.equal('phil');
          next();
        });
      });   
    });
  
  
  
  
    it('create works', function(done){
      store.ready(function(){    
        var User = store.Model('User');
        var phil = User.new({
          login:'michl',
          not_in_the_database: 'foo'
        });
      
        phil.save(function(success){
          success.should.be.true;
          phil.id.should.be.equal(2);
          done();
        });    
      
      });
    });    
  
  
    it('does not load attributes', function(done){
      store.ready(function(){    
        var UnknownTable = store.Model('UnknownTable');
        UnknownTable.definition.attributes.should.be.eql({});
        done();
      });
    });
  
  
  });
  
}