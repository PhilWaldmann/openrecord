var should = require('should');

var Store = require('../../lib/store');

describe('SQL: Conditions', function(){
  var store = new Store({
    type: 'sql'    
  });
  
  store.Model('User', function(){
    this.attribute('my_primary_key', Number, {primary: true});
    this.attribute('login', String);
    this.hasMany('posts');
  });
  
  
  
  store.Model('Post', function(){
    this.attribute('my_primary_key1', Number, {primary: true});
    this.attribute('my_primary_key2', Number, {primary: true});
    this.attribute('message', String);
  });
  
  
  describe('find()', function(){
    it('has method', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.find.should.be.a.Function;
        next();
      });      
    });
    
    
    describe('with one param', function(){
          
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.find(2);
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });        
      });
      
      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.find(2);   
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'users',
            field: 'my_primary_key',
            operator: '=',
            value: 2,
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    
    describe('with multiple param', function(){
      
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.find([2, 3, 4, 5]);
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        })   
        
      });
      
      it('has the right conditions', function(next){    
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.find([2, 3, 4, 5]);  
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'users',
            field: 'my_primary_key',
            operator: '=',
            value: [2, 3, 4, 5],
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with multiple primary keys', function(){
      
  
      
    
      it('has conditions', function(next){
        store.ready(function(){
          var Post = store.Model('Post');
          var Chained = Post.find(4, 899);
          Chained.getInternal('conditions').length.should.be.equal(2);
          next();
        });        
      });
      
      it('has the right conditions', function(next){
        store.ready(function(){
          var Post = store.Model('Post');
          var Chained = Post.find(4, 899);
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'posts',
            field: 'my_primary_key1',
            operator: '=',
            value: 4,
            name_tree: []
          },{
            type: 'hash',
            table: 'posts',
            field: 'my_primary_key2',
            operator: '=',
            value: 899,
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
  });
  
  
  
  
  
  
  
  
  describe('where()', function(){
    it('has method', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.where.should.be.a.Function;
        next();
      });
    });
    
    describe('with hash', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({login:'phil'}); 
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({login:'phil'}); 
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'users',
            field: 'login',
            operator: '=',
            value: 'phil',
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    describe('with hash (like)', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({login_like:'phil'});
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({login_like:'phil'});     
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'users',
            field: 'login',
            operator: 'like',
            value: '%phil%',
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with hash (multiple)', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({login_like:'phil', id:[2, 3]});
          Chained.getInternal('conditions').length.should.be.equal(2);
          next();
        });
      });
      
      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({login_like:'phil', id:[2, 3]});   
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'users',
            field: 'login',
            operator: 'like',
            value: '%phil%',
            name_tree: []
          },{
            type: 'hash',
            table: 'users',
            field: 'id',
            operator: '=',
            value: [2, 3],
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with array of hashes', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where([{login_like:'phil'}, {id:[2, 3]}]);
          Chained.getInternal('conditions').length.should.be.equal(2);
          next();
        });
      });
      
      it('has the right conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where([{login_like:'phil'}, {id:[2, 3]}]);     
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'users',
            field: 'login',
            operator: 'like',
            value: '%phil%',
            name_tree: []
          },{
            type: 'hash',
            table: 'users',
            field: 'id',
            operator: '=',
            value: [2, 3],
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with joined table conditions', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({posts:{id:[1, 2, 3]}});
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){  
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({posts:{id:[1, 2, 3]}});    
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            table: 'posts',
            field: 'id',
            operator: '=',
            value: [1, 2, 3],
            name_tree: ['posts']
          }]);
          next();
        });
      });
    });
    
    
    describe('with string', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where('login IS NULL');
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){  
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where('login IS NULL');    
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: [],
            query: 'login IS NULL',
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    describe('with string and "?" placeholder', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where('login = ?', 'phil');
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where('login = ?', 'phil');
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with array and "?" placeholder', function(){
    
      it('has conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where(['login = ?', 'phil']); 
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where(['login = ?', 'phil']); 
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with sting and hash placeholder', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where('login = :login', {login: 'phil'});
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where('login = :login', {login: 'phil'});
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with array and hash placeholder', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where(['login = :login', {login: 'phil'}]);
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where(['login = :login', {login: 'phil'}]);    
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }]);
          next();
        });
      });
    });
    
    
    describe('with array and hash placeholder on a relation', function(){
    
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({posts:['message = :message', {message: 'hello'}]});
          Chained.getInternal('conditions').length.should.be.equal(1);
          next();
        });
      });
      
      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Chained = User.where({posts:['message = :message', {message: 'hello'}]});  
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['hello'],
            query: 'message = ?',
            name_tree: ['posts']
          }]);
          next();
        });
      });
    });
    
  });
  
});