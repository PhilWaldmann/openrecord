var should = require('should');

var Store = require('../lib/store');

describe('Store: Base', function(){

  describe('is a function', function(){
    Store.should.be.a.Function;
  });
  
  describe('without config', function(){
    var store = new Store();
  
    it('has the base definition loaded', function(){
      store.type.should.be.equal('base');
    });
  });
  
  describe('Model()', function(){
  
    describe('without params', function(){
      var store = new Store();
    
      store.Model('User', function(done){
        done();
      });
    
      var User = store.Model('User');
  
      it('returns the model', function(){
        should.exist(User);
      });
    });
    
    describe('without call of done', function(){
      var store = new Store();
    
      store.Model('User', function(){
        
      });
    
      var User = store.Model('User');
  
      it('returns the model', function(){
        should.exist(User);
      });
    });
  
    describe('without global on', function(){
      var store = new Store({
        global:true
      });
    
      store.Model('User', function(done){
        done();
      });
  
      it('creates global models', function(){
        should.exist(User);
      });
    });
      
  });
  
  describe('ready()', function(){
    var store = new Store();
  
    store.Model('User', function(done){
      done();
    });
    
    store.Model('Post', function(done){
      setTimeout(done, 30);
    });  
    
    it('will be called after all models are ready', function(done){
      store.ready(function(){
        should.exist(store.Model('User'));
        should.exist(store.Model('Post'));
        done();
      });
    });
    
  });
  
});