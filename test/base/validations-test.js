var should = require('should');

var Store = require('../../lib/store');

describe('Validation', function(){
  
  describe('validatesPresenceOf()', function(){
    var store = new Store();

    store.Model('User', function(){
      this.attribute('email', String);
      this.validatesPresenceOf('email');  
    });
  
    var User = store.Model('User');
    var valid = new User({email:'philw@gmx.net'});
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
    
  });
  
  
  
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
    
  });
    
   
   
  describe('validatesFormatOf()', function(){
    var store = new Store();

    store.Model('User', function(){
      this.attribute('mail', String);
      this.validatesFormatOf('mail', 'email');  
    });
  
    var User = store.Model('User');
    var valid = new User({mail:'philw@gmx.net'});
    var invalid = new User({mail:'not.a.valid@email!'});
    
    
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
        invalid.errors.should.have.property('mail');
        done();
      });
    });  
    
  });
  
  
  
  
  describe('validates()', function(){
    var store = new Store();

    store.Model('User', function(){
      this.attribute('login', String);
      
      this.validates('login', function(next){
        var context = this;
        context.should.have.property('login');
        setTimeout(function(){
          if(context.login == 'admin'){
            next();
          }else{
            context.errors.add('login', 'is not admin');
            next(false);
          }          
        }, 10);
      });  
    });
  
    var User = store.Model('User');
    var valid = new User({login:'admin'});
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
        invalid.errors.should.have.property('login');
        done();
      });
    });  
    
  }); 
  
  
});