var should = require('should');

var Store = require('../../../lib/store');



describe('SQLite3: Attributes', function(){
  var store;
  var database = __dirname + '/attributes_test.sqlite3';



  before(function(next){
    beforeSQLite(database, [
      'CREATE TABLE attribute_tests(text_attribute  TEXT, numeric_attribute NUMERIC, integer_attribute  INTEGER, real_attribute  REAL, blob_attribute BLOB)',
      'CREATE TABLE attribute_lowercase_tests(text_attribute  text, numeric_attribute numeric, integer_attribute  integer, real_attribute  real, blob_attribute blob)'
    ], next);
  });

  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: database
    });

    store.Model('AttributeTest', function(){});
    store.Model('AttributeLowercaseTest', function(){});
  });

  after(function(){
    afterSQLite(database);
  });




  it('have all attributes loaded', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest');

      var attrs = AttributeTest.definition.attributes;

      attrs.should.have.property('text_attribute');
      attrs.should.have.property('numeric_attribute');
      attrs.should.have.property('integer_attribute');
      attrs.should.have.property('real_attribute');
      attrs.should.have.property('blob_attribute');

      done();
    });
  });

  it('have the right attribute types', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest');

      var attrs = AttributeTest.definition.attributes;

      attrs.text_attribute.type.name.should.be.equal('string');
      attrs.numeric_attribute.type.name.should.be.equal('float');
      attrs.integer_attribute.type.name.should.be.equal('integer');
      attrs.real_attribute.type.name.should.be.equal('float');
      attrs.blob_attribute.type.name.should.be.equal('string');

      done();
    });
  });


  it('have all attributes loaded (lowercase)', function(done){
    store.ready(function(){
      var AttributeLowercaseTest = store.Model('AttributeLowercaseTest');

      var attrs = AttributeLowercaseTest.definition.attributes;

      attrs.should.have.property('text_attribute');
      attrs.should.have.property('numeric_attribute');
      attrs.should.have.property('integer_attribute');
      attrs.should.have.property('real_attribute');
      attrs.should.have.property('blob_attribute');

      done();
    });
  });

  it('have the right attribute types (lowercase)', function(done){
    store.ready(function(){
      var AttributeLowercaseTest = store.Model('AttributeLowercaseTest');

      var attrs = AttributeLowercaseTest.definition.attributes;

      attrs.text_attribute.type.name.should.be.equal('string');
      attrs.numeric_attribute.type.name.should.be.equal('float');
      attrs.integer_attribute.type.name.should.be.equal('integer');
      attrs.real_attribute.type.name.should.be.equal('float');
      attrs.blob_attribute.type.name.should.be.equal('string');

      done();
    });
  });

});
