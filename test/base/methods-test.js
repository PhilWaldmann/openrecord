var should = require('should');

var Store = require('../../lib/store');

describe('Methods', function(){
  var store = new Store();

  store.Model('User', function(){
    this.my_method = function(){
      this.should.have.property('attributes');
      this.should.have.property('errors');
    };    
  });
  
  var User = store.Model('User');
  var phil = new User();
    
    
  it('is defined', function(){
    should.exist(phil.my_method);
    phil.my_method.should.be.a.Function;
  });

  it('has the right context', function(){
    phil.my_method();
  });
    
  
});