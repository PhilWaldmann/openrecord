var should = require('should');

var Store = require('../../lib/store');

describe('SQL: Conditions', function(){
  var store = new Store({
    type: 'sql'    
  });
  
  store.Model('User', function(){
    this.attribute('my_primary_key', Number, {primary: true});
    this.attribute('login', String);
  });
  
  var User = store.Model('User');
  
  
  describe('find()', function(){
    it('has method', function(){
      User.find.should.be.a.Function;
    });
    
    describe('with one param', function(){
      var Chained = User.find(2);
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'hash',
          table: 'users',
          field: 'my_primary_key',
          operator: '=',
          value: 2,
          name_tree: []
        }]);
      });
    });
    
    
    
    describe('with multiple param', function(){
      var Chained = User.find([2, 3, 4, 5]);
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'hash',
          table: 'users',
          field: 'my_primary_key',
          operator: '=',
          value: [2, 3, 4, 5],
          name_tree: []
        }]);
      });
    });
    
    
    describe('with multiple primary keys', function(){
      store.Model('Post', function(){
        this.attribute('my_primary_key1', Number, {primary: true});
        this.attribute('my_primary_key2', Number, {primary: true});
      });
  
      var Post = store.Model('Post');
      var Chained = Post.find(4, 899);
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(2);
      });
      
      it('has the right conditions', function(){      
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
      });
    });
    
    
  });
  
  
  
  
  
  
  
  
  describe('where()', function(){
    it('has method', function(){
      User.where.should.be.a.Function;
    });
    
    describe('with hash', function(){
      var Chained = User.where({login:'phil'});
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'hash',
          table: 'users',
          field: 'login',
          operator: '=',
          value: 'phil',
          name_tree: []
        }]);
      });
    });
    
    describe('with hash (like)', function(){
      var Chained = User.where({login_like:'phil'});
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'hash',
          table: 'users',
          field: 'login',
          operator: 'like',
          value: '%phil%',
          name_tree: []
        }]);
      });
    });
    
    
    describe('with hash (multiple)', function(){
      var Chained = User.where({login_like:'phil', id:[2, 3]});
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(2);
      });
      
      it('has the right conditions', function(){      
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
      });
    });
    
    
    describe('with array of hashes', function(){
      var Chained = User.where([{login_like:'phil'}, {id:[2, 3]}]);
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(2);
      });
      
      it('has the right conditions', function(){      
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
      });
    });
    
    
    describe('with joined table conditions', function(){
      var Chained = User.where({posts:{id:[1, 2, 3]}});
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'hash',
          table: 'posts',
          field: 'id',
          operator: '=',
          value: [1, 2, 3],
          name_tree: ['posts']
        }]);
      });
    });
    
    
    describe('with string', function(){
      var Chained = User.where('login IS NULL');
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'raw',
          args: [],
          query: 'login IS NULL'
        }]);
      });
    });
    
    describe('with string and "?" placeholder', function(){
      var Chained = User.where('login = ?', 'phil');
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'raw',
          args: ['phil'],
          query: 'login = ?'
        }]);
      });
    });
    
    
    describe('with array and "?" placeholder', function(){
      var Chained = User.where(['login = ?', 'phil']);
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'raw',
          args: ['phil'],
          query: 'login = ?'
        }]);
      });
    });
    
    
    describe('with sting and hash placeholder', function(){
      var Chained = User.where('login = :login', {login: 'phil'});
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'raw',
          args: ['phil'],
          query: 'login = ?'
        }]);
      });
    });
    
    
    describe('with array and hash placeholder', function(){
      var Chained = User.where(['login = :login', {login: 'phil'}]);
    
      it('has conditions', function(){      
        Chained.getInternal('conditions').length.should.be.equal(1);
      });
      
      it('has the right conditions', function(){      
        Chained.getInternal('conditions').should.be.eql([{
          type: 'raw',
          args: ['phil'],
          query: 'login = ?'
        }]);
      });
    });
    
  });
  
});