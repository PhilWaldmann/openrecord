var should = require('should');

var Store = require('../../../lib/store');


describe('validatesLengthOf()', function(){
  var store = new Store();

  store.Model('User', function(){
    this.attribute('email', String);
    this.validatesLengthOf('email', 20);
  });

  var User, valid, invalid;
  before(function(next){
    store.ready(function(){

      User = store.Model('User');
      valid = new User({email:'philipp@email.com'});
      invalid = new User({email:'philipps.superlong.email@email.com'});

      next();
    });
  });


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
      invalid.errors.should.have.property('email');
      done();
    });
  });

});
