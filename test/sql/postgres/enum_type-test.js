var Store = require('../../../store/postgres')

describe('Postgres: ENUM Attribute', function() {
  var store
  var database = 'enum_attributes_test'

  before(function(next) {
    this.timeout(5000)
    beforePG(
      database,
      [
        "CREATE type my_enum AS ENUM('foo', 'bar')",
        'CREATE TABLE attribute_tests(id serial primary key, enum_attribute my_enum)',
        "INSERT INTO attribute_tests (enum_attribute)VALUES('foo')"
      ],
      next
    )
  })

  before(function() {
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    })

    store.Model('AttributeTest', function() {})
  })

  after(function(next) {
    afterPG(database, next)
  })

  it('has enum_attribute', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')

      var attrs = AttributeTest.definition.attributes

      attrs.should.have.property('enum_attribute')
    })
  })

  it('enum_attribute is a string', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')

      var attrs = AttributeTest.definition.attributes

      attrs.enum_attribute.type.name.should.be.equal('string')
    })
  })

  it('does not allow to save any other value than defined in enum', function() {
    return store
      .ready(function() {
        var AttributeTest = store.Model('AttributeTest')

        return AttributeTest.create({
          enum_attribute: 'unknown'
        })
      })
      .should.be.rejectedWith(store.ValidationError, {
        errors: { enum_attribute: ['only allow one of [foo, bar]'] }
      })
  })

  it('saves valid enum value', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')

      return AttributeTest.create({
        enum_attribute: 'foo'
      })
    })
  })
})
