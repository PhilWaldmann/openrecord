var should = require('should');

var Store = require('../../../lib/store');



describe('Postgres: Attributes', function(){
  var store;
  var database = 'attributes_test';
  
  
  
  before(function(next){
    beforePG(database, [
      'CREATE TABLE attribute_tests(char_attribute  varchar(255), float_attribute float, integer_attribute  integer, text_attribute text)',
      'CREATE TABLE users(id  serial primary key, login TEXT NOT NULL, email TEXT)',
      'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, PRIMARY KEY(id, id2))'
    ], next);
  });
  
  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    });

    store.Model('AttributeTest', function(){});
    store.Model('User', function(){});
    store.Model('MultipleKey', function(){});
    store.Model('UnknownTable', function(){});
    
    store.on('exception', function(){});
  });
  
  after(function(next){
    afterPG(database, next);   
  });
    
    
  
  it('does not load attributes', function(done){
    store.ready(function(){    
      var UnknownTable = store.Model('UnknownTable');
      UnknownTable.definition.attributes.should.be.eql({});    
      done();
    });
  });
  
    
  
  it('have all attributes loaded', function(done){
    store.ready(function(){    
      var AttributeTest = store.Model('AttributeTest');

      var attrs = AttributeTest.definition.attributes;
      
      attrs.should.have.property('char_attribute');
      attrs.should.have.property('float_attribute');
      attrs.should.have.property('integer_attribute');
      attrs.should.have.property('text_attribute');
    
      done();
    });
  });
  
  
});