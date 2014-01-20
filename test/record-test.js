var should = require('should');

var Store = require('../lib/store');

describe('Record: Base', function(){
  var store = new Store();

  store.Model('User', function(){
    
  });
  var User = store.Model('User');
  var phil = new User({
    email: 'phiw@gmx.net'
  });

  it('is a object', function(){
    phil.should.be.a.Object;
  });

  it('has validate() mixin method', function(){
    should.exist(phil.validate);
    phil.validate.should.be.a.Function;
  });
  
  it('has definition', function(){
    should.exist(phil.definition);
  });
  
  it('has correct model name', function(){
    phil.model.should.be.equal(User);
  });
});