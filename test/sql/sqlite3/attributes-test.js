var should = require('should');

var Store = require('../../../lib/store');



describe('SQLite3: Attributes', function(){
  var store;
  var db_file = __dirname + '/attributes_test.sqlite3';
  
  
  
  before(function(next){
    beforeSql(db_file, [
      'CREATE TABLE attribute_tests(text_attribute  TEXT, numeric_attribute NUMERIC, integer_attribute  INTEGER, real_attribute  REAL, blob_attribute BLOB)',
      'CREATE TABLE attribute_lowercase_tests(text_attribute  text, numeric_attribute numeric, integer_attribute  integer, real_attribute  real, blob_attribute blob)',
      'CREATE TABLE users(id  INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT NOT NULL, email TEXT)',
      'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, PRIMARY KEY(id, id2))',
      'INSERT INTO users(login, email) VALUES("phil", "phil@mail.com")'
    ], next);
  });
  
  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: db_file
    });

    store.Model('AttributeTest', function(){});
    store.Model('AttributeLowercaseTest', function(){});
    store.Model('User', function(){});
    store.Model('MultipleKey', function(){});
  });
  
  after(function(){
    afterSql(db_file);
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
      
      attrs.text_attribute.type.name.indexOf('text').should.not.be.equal(-1);
      attrs.numeric_attribute.type.name.indexOf('numeric').should.not.be.equal(-1);
      attrs.integer_attribute.type.name.indexOf('integer').should.not.be.equal(-1);
      attrs.real_attribute.type.name.indexOf('real').should.not.be.equal(-1);
      attrs.blob_attribute.type.name.indexOf('blob').should.not.be.equal(-1);
    
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
      
      attrs.text_attribute.type.name.indexOf('text').should.not.be.equal(-1);
      attrs.numeric_attribute.type.name.indexOf('numeric').should.not.be.equal(-1);
      attrs.integer_attribute.type.name.indexOf('integer').should.not.be.equal(-1);
      attrs.real_attribute.type.name.indexOf('real').should.not.be.equal(-1);
      attrs.blob_attribute.type.name.indexOf('blob').should.not.be.equal(-1);
    
      done();
    });
  });
  
  
  
  it('has the right primary_key', function(done){
    store.ready(function(){    
      var User = store.Model('User');

      var primary_keys = User.definition.primary_keys;
      primary_keys.should.be.eql(['id']);
    
      done();
    });
  });
  
  it('has multiple primary_keys', function(done){
    store.ready(function(){    
      var MultipleKey = store.Model('MultipleKey');

      var primary_keys = MultipleKey.definition.primary_keys;
      primary_keys.should.be.eql(['id', 'id2']);
    
      done();
    });
  });
  
  
  it('has NOT NULL attributes', function(done){
    store.ready(function(){    
      var User = store.Model('User');

      var attributes = User.definition.attributes;
      attributes.login.notnull.should.be.true;
    
      done();
    });
  });
  
  
  it('has automatic validation', function(done){
    store.ready(function(){    
      var User = store.Model('User');
      var phil = User.new();
      
      phil.isValid(function(valid){
        valid.should.be.false;
        phil.errors.should.have.property('login');
        done();
      });    
      
    });
  });
  
  
  it('loaded record to not have any changes', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.find(1).exec(function(result){
        should.exist(result);
        result.hasChanges().should.be.false;
        result.login.should.be.equal('phil');
        next();
      });
    });   
  });
  
  
});