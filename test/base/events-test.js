var should = require('should');

var Store = require('../../lib/store');

describe('Events', function(){
  var store = new Store();

  store.Model('User', function(){
    var self = this;
    
        
    describe('emit()', function(){
    
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
      
    });
    
  });
  
});