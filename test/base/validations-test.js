var should = require('should');

var Store = require('../../lib/store');

describe('Validation', function(){
  
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
    
    
    
    
    
    
    describe('base validation', function(){
      
      var store = new Store();

      store.Model('User', function(){
        this.attribute('login', String);
        this.attribute('email', String);
    
        this.validates(function(){
          var valid = this.login != this.email;
          if(!valid) this.errors.add('Login and E-Mail are not allowed to be the same value');
          return valid;
        });  
      });

      var User = store.Model('User');
      var valid = new User({login:'phil', email:'philipp@email.com'});
      var invalid = new User({login:'philipp@email.com', email:'philipp@email.com'});
  
  
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
          invalid.errors.should.not.have.property('login');
          invalid.errors.should.have.property('base');
          done();
        });
      }); 
      
    })
    
  }); 
  
  
});