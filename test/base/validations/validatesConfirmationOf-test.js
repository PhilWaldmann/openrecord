var should = require('should');

var Store = require('../../../lib/store');


describe('validatesConfirmationOf()', function(){
  var store = new Store();

  store.Model('User', function(){
    this.attribute('password', String);
    this.attribute('password_confirmation', String);
    this.validatesConfirmationOf('password');  
  });

  var User = store.Model('User');
  var valid = new User({password:'my!secret?password', password_confirmation:'my!secret?password'});
  var invalid = new User({password:'1234', password_connfirmation:'abc'});
  
  
  it('returns true on valid records', function(done){
    valid.isValid(function(valid){
      valid.should.be.true;
      done();
    });
  });
  
  it('returns false on wrong confirmation', function(done){
    invalid.isValid(function(valid){
      valid.should.be.false;
      done();
    });
  });   
  
  it('returns the right error message', function(done){
    invalid.isValid(function(valid){
      invalid.errors.should.have.property('password');
      done();
    });
  });
  
  
  
  describe('with multiple params', function(){
    var store = new Store();

    store.Model('User', function(){
      this.attribute('password', String);
      this.attribute('password_confirmation', String);
      this.attribute('email', String);
      this.attribute('email_confirmation', String);
      this.validatesConfirmationOf('password', 'email');  
    });

    var User = store.Model('User');
    var valid = new User({password:'my!secret?password', password_confirmation:'my!secret?password', email:'philipp@email.com', email_confirmation:'philipp@email.com'});
    var invalid = new User({password:'1234', password_connfirmation:'abc', email:'philipp@email.com', email_confirmation:'philw@gmx.at'});
  
  
    it('returns true on valid records', function(done){
      valid.isValid(function(valid){
        valid.should.be.true;
        done();
      });
    });
  
    it('returns false on wrong confirmation', function(done){
      invalid.isValid(function(valid){
        valid.should.be.false;
        done();
      });
    });   
  
    it('returns the right error message', function(done){
      invalid.isValid(function(valid){
        invalid.errors.should.have.property('password');
        invalid.errors.should.have.property('email');
        done();
      });
    });  
  })
  
});