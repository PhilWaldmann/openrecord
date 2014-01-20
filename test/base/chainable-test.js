var should = require('should');

var Store = require('../../lib/store');

describe('Chainable', function(){
  var store = new Store();

  store.Model('User', function(){
    
  });
  var User = store.Model('User');

  describe('chain()', function(){
  
    var ChainedUser = User.chain();
  
    it('returns a new Model class', function(){
      ChainedUser.should.not.be.equal(User);
    });
  
    it('is an array', function(){
      ChainedUser.should.be.an.instanceof(Array);
    });
  
    it('has model class methods', function(){
      ChainedUser.should.have.property('new');
      ChainedUser.should.have.property('chain');
    });
  
    it('has the definition', function(){
      ChainedUser.should.have.property('definition');
    });
  
    it('has model instance methods', function(){
      var user = ChainedUser.new();
      user.should.have.property('validate');
    });
  
    it('does not return a new Model class on the next call', function(){
      ChainedUser.chain().should.not.be.equal(User);
      ChainedUser.chain().should.be.equal(ChainedUser);
    });

  });

});

