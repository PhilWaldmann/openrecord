var should = require('should');

var Store = require('../../../lib/store');


describe('validatesPresenceOf()', function(){
  var store = new Store();

  store.Model('User', function(){
    this.attribute('email', String);
    this.validatesPresenceOf('email');  
  });

  var User = store.Model('User');
  var valid = new User({email:'philipp@email.com'});
  var invalid = new User();
  
  it('exists', function(){
    should.exist(valid.isValid);
    valid.isValid.should.be.a.Function;
  });
  
  it('returns true on valid records', function(done){
    valid.isValid(function(valid){
      valid.should.be.true;
      done();
    });
  });
  
  it('returns false on invalid records', function(done){
    invalid.isValid(function(valid){
      valid.should.be.false;
      done();
    });
  });
  
  it('returns the right error message', function(done){
    invalid.isValid(function(valid){
      invalid.should.have.property('email');
      done();
    });
  });
  
  
  
  
  
  
  describe('with multiple params', function(){
    var store = new Store();
    
    store.Model('User', function(){
      this.attribute('login', String);
      this.attribute('email', String);
      this.validatesPresenceOf('email', 'login');  
    });

    var User = store.Model('User');
    var valid = new User({email:'philipp@email.com', login: 'phil'});
    var invalid = new User({login:'phil'});
    
    it('returns true on valid records', function(done){
      valid.isValid(function(valid){
        valid.should.be.true;
        done();
      });
    });
  
    it('returns false on invalid records', function(done){
      invalid.isValid(function(valid){
        valid.should.be.false;
        done();
      });
    });
    
    it('returns the right error message', function(done){
      invalid.isValid(function(valid){
        invalid.should.have.property('email');
        done();
      });
    });
    
  });
  
  
});