var should = require('should');

var Store = require('../lib/store');

describe('Model: Base', function(){
  var store = new Store();

  store.Model('User', function(){
    
  });
  var User = store.Model('User');

  it('is a function', function(){
    User.should.be.a.Function;
  });

  it('has new() mixin method', function(){
    should.exist(User.new);
    User.new.should.be.a.Function;
  });
  
  it('has chain() mixin method', function(){
    should.exist(User.chain);
    User.chain.should.be.a.Function;
  });
  
  it('has definition', function(){
    should.exist(User.definition);
  });
  
  it('has correct model name', function(){
    User.definition.model_name.should.be.equal('User');
  });
  
});