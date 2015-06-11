var should = require('should');

var Store = require('../../lib/store');

describe('Chainable', function(){
  var store = new Store();
  var User;
  
  store.Model('User', function(){});
  
  
  before(function(){
    store.ready(function(){
      User = store.Model('User');
    });    
  })

  describe('chain()', function(){
  
    var ChainedUser;
    
    before(function(){
      ChainedUser = User.chain();
    });
  
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
  
  
  describe('setInternal(), getInternal(), addInternal()', function(){
  
    var ChainedUser;
    
    before(function(){
      ChainedUser = User.chain();
    });
  
    it('has method setInternal()', function(){
      ChainedUser.setInternal.should.be.a.Function;
    });
    
    it('has method getInternal()', function(){
      ChainedUser.getInternal.should.be.a.Function;
    });
    
    it('has method addInternal()', function(){
      ChainedUser.addInternal.should.be.a.Function;
    });
    
    
    it('getInternal() returns the right value', function(){
      ChainedUser.setInternal('my_attr', 'my_value');
      ChainedUser.getInternal('my_attr').should.be.equal('my_value');
    });
    
    
    it('getInternal() returns the right value after some changes', function(){
      ChainedUser.setInternal('my_attr2', 'my_old_value');
      ChainedUser.setInternal('my_attr2', 'my_new_value');
      ChainedUser.getInternal('my_attr2').should.be.equal('my_new_value');
    });
    
    it('getInternal() returns null on unknown attributes', function(){
      should.not.exist(ChainedUser.getInternal('unknown_attr'));
    });
    
    
    it('getInternal() returns objects', function(){
      ChainedUser.setInternal('my_attr3', {a:2, b:3});
      ChainedUser.getInternal('my_attr3').should.be.eql({a:2, b:3});
    });

    
    it('getInternal() returns an array', function(){
      ChainedUser.addInternal('my_attr4', 'A');
      ChainedUser.getInternal('my_attr4').should.be.eql(['A']);
    });
    
    
    it('getInternal() returns an array', function(){
      ChainedUser.addInternal('my_attr5', 'A');
      ChainedUser.addInternal('my_attr5', 'B');
      ChainedUser.getInternal('my_attr5').should.be.eql(['A', 'B']);
    });
    
    
    it('concatenates arrays', function(){
      ChainedUser.addInternal('my_attr6', 'A');
      ChainedUser.addInternal('my_attr6', ['B', 'C']);
      ChainedUser.addInternal('my_attr6', ['D']);
      ChainedUser.getInternal('my_attr6').should.be.eql(['A', 'B', 'C', 'D']);
    });

  });

});

