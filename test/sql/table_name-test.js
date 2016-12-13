var should = require('should');

var Store = require('../../lib/store');

describe('SQL: Table Name', function(){
  var store;

  before(function(){
    store = new Store({
      type: 'sql'
    });

    store.Model('User', function(){});
    store.Model('CamelCasedTableName', function(){});
  });


  it('has the right table name', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.definition.table_name.should.be.equal('users');
      next();
    });
  });

  it('has the right table name on camelcased models', function(next){
    store.ready(function(){
      var CamelCasedTableName = store.Model('CamelCasedTableName');
      CamelCasedTableName.definition.table_name.should.be.equal('camel_cased_table_names');
      next();
    });
  });

  it('returns a model by it\'s table name', function(next){
    store.ready(function(){
      var CamelCasedTableName = store.getByTableName('camel_cased_table_names');
      CamelCasedTableName.definition.table_name.should.be.equal('camel_cased_table_names');
      next();
    });
  })

});
