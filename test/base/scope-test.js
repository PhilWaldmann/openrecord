var should = require('should');

var Store = require('../../lib/store');

describe('Scope', function(){
  var store = new Store();

  store.Model('User', function(){
    this.scope('active', function(){
      this.should.have.property('new');
    });    
  });
  
  var User = store.Model('User');
    
  describe('scope()', function(){
    
    it('has defined scope', function(){
      should.exist(User.active);
    });
  
    it('scope is chainable', function(){
      should.exist(User.active().new);
    });
    
  });
  
});