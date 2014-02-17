var should = require('should');

var Store = require('../../../lib/store');


describe('Postgres: all Attributes', function(){
  var store;
  var database = 'all_attributes_test';
  
  
  
  before(function(next){
    beforePG(database, [
      'CREATE TABLE attribute_tests(char_attribute  varchar(255), float_attribute float, integer_attribute  integer, text_attribute text, boolean_attribute boolean, binary_attribute bytea, date_attribute date, datetime_attribute timestamp, time_attribute time)'
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
    
    store.on('exception', function(){});
  });
  
  after(function(next){
    afterPG(database, next);   
  });
    
      
    
  
  it('have all attributes loaded', function(done){
    store.ready(function(){    
      var AttributeTest = store.Model('AttributeTest');

      var attrs = AttributeTest.definition.attributes;
            
      attrs.should.have.property('char_attribute');
      attrs.should.have.property('float_attribute');
      attrs.should.have.property('integer_attribute');
      attrs.should.have.property('text_attribute');
      attrs.should.have.property('boolean_attribute'); 
      attrs.should.have.property('binary_attribute');
      attrs.should.have.property('date_attribute');
      attrs.should.have.property('datetime_attribute');
      attrs.should.have.property('time_attribute');
    
      done();
    });
  }); 
  
});

