var Store = require('../../store/sql')

describe('SQL: Table Name', function() {
  var store

  before(function() {
    store = new Store({
      type: 'sql'
    })

    store.Model('User', function() {})
    store.Model('CamelCasedTableName', function() {})
  })

  it('has the right table name', function() {
    return store.ready(function() {
      var User = store.Model('User')
      User.definition.tableName.should.be.equal('users')
    })
  })

  it('has the right table name on camelcased models', function() {
    return store.ready(function() {
      var CamelCasedTableName = store.Model('CamelCasedTableName')
      CamelCasedTableName.definition.tableName.should.be.equal(
        'camel_cased_table_names'
      )
    })
  })

  it("returns a model by it's table name", function() {
    return store.ready(function() {
      var CamelCasedTableName = store.getByTableName('camel_cased_table_names')
      CamelCasedTableName.definition.tableName.should.be.equal(
        'camel_cased_table_names'
      )
    })
  })
})
