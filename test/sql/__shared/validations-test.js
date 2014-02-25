var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Empty', function(){
    var store;
  
    before(beforeFn);
    after(afterFn);
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){
        this.validatesUniquenessOf('login', 'email');
      
        this.beforeValidation(function(){
          this.save.should.be.a.Function;
          return this.login != 'max';
        });
      });
      store.Model('MultipleKey', function(){
        this.validatesUniquenessOf('name');
      });
      store.Model('WithScope', function(){
        this.validatesUniquenessOf('name', {scope: 'scope_id'});
      });
    });
    
    
    
    describe('beforeValidation()', function(){
      it('gets called on create', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.create({
            login:'max'
          }, function(result){
            result.should.be.false;
            next();
          });        
        });
      });
    
    
      it('gets called on update', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(1, function(phil){
            phil.login = 'max';
            phil.save(function(result){
              result.should.be.false;
              next();
            });
          });      
        });
      });
    });
  
  
  
    describe('validatesUniquenessOf()', function(){
    
      it('returns false on duplicate entries (create)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var phil2 = User.new({
            login:'phil'
          });
        
          phil2.isValid(function(valid){
            valid.should.be.false;
            next();
          });
        
        });
      });
    
    
      it('returns true on valid entry (create)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var phil2 = User.new({
            login:'phil2'
          });
        
          phil2.isValid(function(valid){
            valid.should.be.true;
            next();
          });
        
        });
      });
    
      it('returns false on duplicate entries (update)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var phil2 = User.new({
            id: 5,
            login:'phil'
          });
        
          phil2.isValid(function(valid){
            valid.should.be.false;
            next();
          });
        
        });
      });
    
    
      it('returns true on valid entry (update)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var phil2 = User.new({
            id: 1,
            login:'phil'
          });
        
          phil2.isValid(function(valid){
            valid.should.be.true;
            next();
          });
        
        });
      });
     
     
      it('works with multiple primary_keys (create)', function(next){ 
        store.ready(function(){
          var MultipleKey = store.Model('MultipleKey');
          var phil = MultipleKey.new({
            id: 5,
            id2: 5,
            name:'phil'
          });
        
          phil.isValid(function(valid){
            valid.should.be.false;
            next();
          });
        
        });
      });
    
    
      it('works with multiple primary_keys (update)', function(next){ 
        store.ready(function(){
          var MultipleKey = store.Model('MultipleKey');
          var phil = MultipleKey.new({
            id: 1,
            id2: 1,
            name:'phil'
          });
        
          phil.isValid(function(valid){
            valid.should.be.true;
            next();
          });
        
        });
      });
    
    
    
      it('returns false with scopes (create)', function(next){ 
        store.ready(function(){
          var WithScope = store.Model('WithScope');
          var phil = WithScope.new({
            name:'phil',
            scope_id: 1
          });
        
          phil.isValid(function(valid){
            valid.should.be.false;
            next();
          });
        
        });
      });
    
      it('returns true with scopes (create)', function(next){ 
        store.ready(function(){
          var WithScope = store.Model('WithScope');
          var phil = WithScope.new({
            name:'michl',
            scope_id: 2
          });
        
          phil.isValid(function(valid){
            valid.should.be.true;
            next();
          });
        
        });
      });
    
    
      it('returns false with scopes (update)', function(next){ 
        store.ready(function(){
          var WithScope = store.Model('WithScope');
          var phil = WithScope.new({
            id:2,
            name:'phil',
            scope_id: 1
          });
        
          phil.isValid(function(valid){
            valid.should.be.false;
            next();
          });
        
        });
      });
    
      it('returns true with scopes (update)', function(next){ 
        store.ready(function(){
          var WithScope = store.Model('WithScope');
          var phil = WithScope.new({
            id:1,
            name:'phil',
            scope_id: 1
          });
        
          phil.isValid(function(valid){
            valid.should.be.true;
            next();
          });
        
        });
      });
     
    });
    
    
    
  });
};