var should = require('should');

var Store = require('../lib/store');
var Definition = require('../lib/definition');

describe('Definition: Base', function(){
  var store = new Store();

  var User, Post;

  store.Model('User', function(){
    var self = this;
    
    it('has the correct context', function(){
      self.should.be.an.instanceOf(Definition);
    });
    
    it('has validates() mixin method', function(){
      should.exist(self.validates);
      self.validates.should.be.a.Function;
    });
    
    it('has setter() mixin method', function(){
      should.exist(self.setter);
      self.setter.should.be.a.Function;
    });
    
    it('has getter() mixin method', function(){
      should.exist(self.getter);
      self.getter.should.be.a.Function;
    });
    
    it('has event methods', function(){
      should.exist(self.on);
      self.on.should.be.a.Function;
      
      should.exist(self.emit);
      self.emit.should.be.a.Function;
      
      should.exist(self._events);
    });  
    
  });
  
  store.Model('Post', function(){
    this.validatesPresenceOf('title');
  });
  
  User = store.Model('User');
  Post = store.Model('Post');
  
  it('every model has it own definition', function(){
    User.definition.should.not.be.equal(Post.definition);
  });
  
  it('has no shared variables between models', function(){
    User.definition.validations.should.not.be.equal(Post.definition.validations);
  });
    
});