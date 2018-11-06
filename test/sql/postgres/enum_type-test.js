var path = require('path')

var Store = require('../../../store/postgres')

describe('Postgres: ENUM Attribute', function() {
  var store
  var database = 'enum_attributes_test'

  before(function(next) {
    this.timeout(5000)
    beforePG(database, [], next)
  })

  before(function() {
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: '',
      migrations: path.join(__dirname, 'fixtures', 'migrations', '*'),
      plugins: require('../../../lib/base/dynamic_loading')
    })

    store.Model('EnumTest', function() {})
  })

  after(function(next) {
    afterPG(database, next)
  })

  it('has enum_attribute', function() {
    return store.ready(function() {
      var EnumTest = store.Model('EnumTest')

      var attrs = EnumTest.definition.attributes

      attrs.should.have.property('enum_attribute')
    })
  })

  it('enum_attribute is a string', function() {
    return store.ready(function() {
      var EnumTest = store.Model('EnumTest')

      var attrs = EnumTest.definition.attributes

      attrs.enum_attribute.type.name.should.be.equal('string')
    })
  })

  it('does not allow to save any other value than defined in enum', function() {
    return store
      .ready(function() {
        var EnumTest = store.Model('EnumTest')

        return EnumTest.create({
          enum_attribute: 'unknown'
        })
      })
      .should.be.rejectedWith(store.ValidationError, {
        errors: { enum_attribute: ['only allow one of [foo, bar]'] }
      })
  })

  it('saves valid enum value', function() {
    return store.ready(function() {
      var EnumTest = store.Model('EnumTest')

      return EnumTest.create({
        enum_attribute: 'foo'
      })
    })
  })
})
