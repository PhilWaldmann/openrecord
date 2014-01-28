var should = require('should');

var Store = require('../../../lib/store');

describe('SQLite3: Aggregate Functions', function(){
  var store = new Store({
    type: 'sqlite3',
    file: __dirname + '/database.sqlite' 
  });
  
  store.Model('User', function(){
    this.attribute('salary', Number);
  });
  
  
  
  
  describe('count()', function(){
    it('returns the right sql', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.count('salary').toSql().should.be.equal('select count("salary") from "users"');
        next();
      });      
    });
  });
  
  describe('sum()', function(){
    it('returns the right sql', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.sum('salary').toSql().should.be.equal('select sum("salary") from "users"');
        next();
      });      
    });
  });
  
  describe('max()', function(){
    it('returns the right sql', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.max('salary').toSql().should.be.equal('select max("salary") from "users"');
        next();
      });      
    });
  });
  
  describe('min()', function(){
    it('returns the right sql', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.min('salary').toSql().should.be.equal('select min("salary") from "users"');
        next();
      });      
    });
  });
  
});