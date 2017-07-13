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
      valid.should.be.equal(true);
      done();
    });
  });

  it('returns false on invalid records', function(done){
    invalid.isValid(function(valid){
      valid.should.be.equal(false);
      done();
    });
  });

  it('returns the right error message', function(done){
    invalid.isValid(function(valid){
      invalid.errors.should.have.property('email');
      done();
    });
  });

  describe('with fields array', function(){

    var store = new Store();

    store.Model('User', function(){
      this.attribute('email', String);
      this.attribute('login', String);
      this.validatesLengthOf(['email', 'login'], 20);
    });

    var User, valid, invalid;
    before(function(next){
      store.ready(function(){

        User = store.Model('User');
        valid = new User({email:'philipp@email.com'});
        invalid = new User({email:'philipps.superlong.email@email.com'});
        invalid2 = new User({email: 'fooo', login:'philipps.superlong.email@email.com'});

        next();
      });
    });


    it('returns true on valid records', function(done){
      valid.isValid(function(valid){
        valid.should.be.equal(true);
        done();
      });
    });

    it('returns false on invalid records', function(done){
      invalid.isValid(function(valid){
        valid.should.be.equal(false);
        done();
      });
    });

    it('returns false on invalid records (second field)', function(done){
      invalid2.isValid(function(valid){
        valid.should.be.equal(false);
        done();
      });
    });

    it('returns the right error message', function(done){
      invalid.isValid(function(valid){
        invalid.errors.should.have.property('email');
        done();
      });
    });

  })

});
