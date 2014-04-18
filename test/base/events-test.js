var should = require('should');

var Store = require('../../lib/store');

describe('Events', function(){
  var store = new Store();


  describe('Store', function(){
    describe('emit()', function(){
  
      it('methods exists', function(){
        store.emit.should.be.a.Function;
        store.on.should.be.a.Function;
      });
           
      it('emit events', function(){
        store.on('store_test_event', function(value){
          value.should.be.equal('awesome');
        });
        store.emit('store_test_event', 'awesome');
      });
            
    });
  });


  store.Model('User', function(){
    var self = this;
    
        
    describe('Definition', function(){
      describe('emit()', function(){
    
        it('methods exists', function(){
          self.emit.should.be.a.Function;
          self.on.should.be.a.Function;
        });
    
        var scope = {scope:'test'};
    
        it('emit event with specific scope', function(done){
          self.on('test_event', function(){
            this.should.be.equal(scope);
            done();
          });
        
          self.emit(scope, 'test_event');
        });
      
        it('emit event with specific scope and args', function(done){
          self.on('test_event2', function(test){
            test.should.be.equal('test');
            done();
          });
        
          self.emit(scope, 'test_event2', 'test');
        });
      
        it('emit event without specific scope', function(done){
          self.on('test_event3', function(test){
            this.should.be.equal(self);
            test.should.be.equal('test');
            done();
          });
        
          self.emit('test_event3', 'test');
        });
        
        it('emit event without specific scope2', function(done){
          self.on('test_event4', function(test){
            this.should.be.equal(self);
            test.should.be.equal('test2');
            done();
          });
        
          self.emit('test_event4', 'test2');
        });
      
      });
      
    });
    
    
    self.attribute('login', String);
    
    self.on('record_to_definition_test_event', function(arg1, arg2, done){
      this.login.should.be.equal('phil');
      arg1.should.be.equal('argument1');
      arg2.should.be.equal('argument2');
      done();
    });
    
  });
  
  
  
  describe('Model', function(){
    describe('emit()', function(){
      var User = store.Model('User');
      
      it('does not exists', function(){
        should.not.exist(User.emit);
        should.not.exist(User.on);
      });
            
    });
  });
  
  
  describe('Record', function(){
    describe('emit()', function(){
      var User = store.Model('User');
      var record = new User();
      
      it('does not exists', function(){
        should.not.exist(record.emit);
        should.not.exist(record.on);
      });
            
    });
  });
  
});