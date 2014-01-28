var should = require('should');

var Store = require('../../lib/store');

describe('Interceptors', function(){
  var store = new Store();

  store.Model('User', function(){
    var self = this;
    
    it('has beforeValidation()', function(){
      should.exist(self.beforeValidation);
      self.beforeValidation.should.be.a.Function;
    });
  
  });
  
  
  describe('addInterceptor()', function(){
    
    var store = new Store();
    
    it('exists', function(){
      should.exist(store.addInterceptor);
      store.addInterceptor.should.be.a.Function;
    });
    
    store.addInterceptor('myInterceptor');
    
    it('exists in the definition scope', function(done){
      store.Model('NewModel', function(){
        should.exist(this.myInterceptor);
        this.myInterceptor.should.be.a.Function;
        done();
      });
    }); 
    
    
    it('throws an error on an undefined interceptor', function(done){
      store.Model('NewModel', function(){
        var self = this;
        (function(){
          self.addInterceptor('unknownInterceptor', function(){});
        }).should.throw();
        
        done();
      });
    });       
    
  });
  
    
  
  
  describe('call (without params)', function(){
    var store = new Store();
    var phil;
    
    store.addInterceptor('beforeTest');
    
    store.Model('User', function(){
      should.not.exist(this.myInterceptor);
              
      this.beforeTest(function(){
        this.should.be.equal(phil);
        return false;
      });
    });
          
    var User = store.Model('User');
    phil = new User();
    
    it('has the right scope', function(done){
      phil.callInterceptors('beforeTest', function(){
        done();
      });
    });
    
  });
  
  
  
  
  describe('call (with params)', function(){
    var store = new Store();
    var phil;
    
    store.addInterceptor('beforeTest');
    
    store.Model('User', function(){
      should.not.exist(this.myInterceptor);
              
      this.beforeTest(function(arg1, arg2){
        arg1.should.be.equal('A');
        arg2.should.be.equal('B');
        return false;
      });
    });
          
    var User = store.Model('User');
    phil = new User();
    
    it('gets the right params', function(done){
      phil.callInterceptors('beforeTest', ['A', 'B'], function(result){
        result.should.be.false;
        done();
      });
    });
    
  });
  
  
  
  
  describe('call (with params and async)', function(){
    var store = new Store();
    var phil;
    
    store.addInterceptor('beforeTest');
    
    store.Model('User', function(){
      should.not.exist(this.myInterceptor);
              
      this.beforeTest(function(arg1, next){
        arg1.should.be.equal('A');
        next(false)
      });
    });
          
    var User = store.Model('User');
    phil = new User();
    
    it('gets the right params', function(done){
      phil.callInterceptors('beforeTest', ['A'], function(){
        done();
      });
    });
    
  });
  
  
  
  
  
  describe('call (with multiple interceptors: false)', function(){
    var store = new Store();
    var phil;
    
    store.addInterceptor('beforeTest');
    
    store.Model('User', function(){              
      this.beforeTest(function(arg1, next){
        next(false)
      });
      
      this.beforeTest(function(){
        return true;
      });
    });
          
    var User = store.Model('User');
    phil = new User();
    
    it('is false', function(done){
      phil.callInterceptors('beforeTest', ['A'], function(result){
        result.should.be.false;
        done();
      });
    });
    
  });
  
  
  
  
  describe('call (with multiple interceptors: true)', function(){
    var store = new Store();
    var phil;
    
    store.addInterceptor('beforeSuccessTest');
    
    store.Model('User', function(){              
      this.beforeSuccessTest(function(arg1, next){
        next();
      });
      
      this.beforeSuccessTest(function(){
        return true;
      });
            
      this.beforeSuccessTest(function(arg1){
        return true;
      });

    });
          
    var User = store.Model('User');
    phil = new User();
    
    it('is true', function(done){
      phil.callInterceptors('beforeSuccessTest', ['arg1'], function(result){
        result.should.be.true;
        done();
      });
    });
    
  });
  
  
  
  
  
  describe('call (without any interceptors)', function(){
    var store = new Store();
    var phil;
    
    store.addInterceptor('beforeTest');
    
    store.Model('User', function(){              
  
    });
          
    var User = store.Model('User');
    phil = new User();
    
    it('is true', function(done){
      phil.callInterceptors('beforeTest', ['A'], function(result){
        result.should.be.true;
        done();
      });
    });
    
  });
  
});