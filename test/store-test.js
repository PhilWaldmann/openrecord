var should = require('should');

var Store = require('../lib/store');

describe('Store: Base', function(){
  
  describe('is a function', function(){
    Store.should.be.a.Function;
  });
  
  it('throws an error on unknown type', function(){
    (function(){
      new Store({type:'unknown'});
    }).should.throw();
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
  
  
  
  describe('ready() with more models', function(){
    
    it('will be called after all models are ready', function(done){
      var store = new Store();
      
      store.Model('A', function(done){
        done();
      });
    
      store.Model('B', function(done){
        setTimeout(done, 1);
      });  
    
      store.Model('C', function(done){
        setTimeout(done, 5);
      });  
    
      store.Model('D', function(done){
        setTimeout(done, 10);
      });  
    
      store.Model('E', function(done){
        setTimeout(done, 7);
      });  
    
      store.Model('F', function(done){
        setTimeout(done, 5);
      });  
      
      store.ready(function(){
        should.exist(store.Model('A'));
        should.exist(store.Model('B'));
        should.exist(store.Model('C'));
        should.exist(store.Model('D'));
        should.exist(store.Model('E'));
        should.exist(store.Model('F'));
        done();
      });
    });
    
  });
  
  
  
  describe('ready() with any models', function(){
    var store = new Store();
    
    it('will be called after all models are ready', function(done){
      store.ready(function(){
        done();
      });
    });
    
  });
  
  
  
  describe('loads models via models:"path/*" config', function(){
    var store = new Store({
      models: __dirname + '/fixtures/models/*.js'
    });
    
    it('models are loaded', function(next){
      store.ready(function(){
        should.exist(store.Model('User'));
        should.exist(store.Model('CamelCasedModel'));
        next();
      });
    });
    
  });
  
  
  
  describe('loads plugins via plugins:"path/*" config', function(){
    var store = new Store({
      plugins: __dirname + '/fixtures/plugins/*.js'
    });
    
    it('plugins are loaded on the store', function(){
      store.myStoreFunction.should.be.a.Function;
    });
    
    it('plugins are loaded on the store', function(next){
      store.Model('test', function(){
        this.myDefinitionFunction.should.be.a.Function;
        next();
      });
    });
    
  });
  
});