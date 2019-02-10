var Store = require('../../../store/postgres')

describe('Postgres: Composite Types', function() {
  var store
  var database = 'composite_type_test'

  before(function(next) {
    this.timeout(5000)
    beforePG(
      database,
      [
        'DROP TYPE IF EXISTS customtype',
        'CREATE type customtype AS (foo integer, bar text)',
        'CREATE TABLE attribute_tests(id serial primary key, composite_attribute customtype, second_one customtype)',
        "INSERT INTO attribute_tests (composite_attribute)VALUES(ROW(1,'foo'))",
        "INSERT INTO attribute_tests (composite_attribute)VALUES(ROW(2,'foo bar'))"
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

    store.Model('AttributeTest', function() {
      this.attributes.composite_attribute.use(function() {
        this.validatesPresenceOf('bar')
      })
    })
  })

  after(function(next) {
    afterPG(database, next)
  })

  it('has attribute definition', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.definition.attributes.should.have.property(
        'composite_attribute'
      )
    })
  })

  it('attribute type is composite', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.definition.attributes.composite_attribute.type.name.should.be.equal(
        'composite'
      )
    })
  })

  it('the two field share the same dynamicType', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.definition.attributes.composite_attribute.dynamicType.should.be.equal(
        AttributeTest.definition.attributes.second_one.dynamicType
      )
    })
  })

  it('new record has all composite fields', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      record.toJson().should.be.eql({
        id: null,
        composite_attribute: {
          foo: null,
          bar: null
        },
        second_one: {
          foo: null,
          bar: null
        }
      })
    })
  })

  it('composite fields are available after assignment', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      record.composite_attribute = { foo: 1 }

      record.toJson().should.be.eql({
        id: null,
        composite_attribute: {
          foo: 1,
          bar: null
        },
        second_one: {
          foo: null,
          bar: null
        }
      })
    })
  })

  it('uses composite field validations', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})
      return record.composite_attribute.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })
  })

  it('uses composite field validations on parent record', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      return record.isValid(function(valid) {
        valid.should.be.equal(false)
        record.errors.toJSON().should.be.eql({
          'composite_attribute.bar': ['should be present'],
          'second_one.bar': ['should be present']
        })
      })
    })
  })

  it('record with invalid composite field wont save', function() {
    return store
      .ready(function() {
        var AttributeTest = store.Model('AttributeTest')
        var record = new AttributeTest({})

        return record.save()
      })
      .should.be.rejectedWith(store.ValidationError, {
        errors: {
          'composite_attribute.bar': ['should be present'],
          'second_one.bar': ['should be present']
        }
      })
  })

  it('read composite type', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.find(1)
        .exec()
        .then(function(record) {
          record.toJson().should.be.eql({
            id: 1,
            composite_attribute: {
              foo: 1,
              bar: 'foo'
            },
            second_one: null
          })
        })
    })
  })

  it('composite field values are parsed correct', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.find(2)
        .exec()
        .then(function(record) {
          record.toJson().should.be.eql({
            id: 2,
            composite_attribute: {
              foo: 2,
              bar: 'foo bar'
            },
            second_one: null
          })
        })
    })
  })

  it('changes in composite field are recognised in record', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.find(1)
        .exec()
        .then(function(record) {
          record.composite_attribute.foo = 2

          record.hasChanges().should.be.equal(true)
        })
    })
  })

  it('no changes in composite field are recognised in record as well', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.find(1)
        .exec()
        .then(function(record) {
          record.hasChanges().should.be.equal(false)
        })
    })
  })

  it('saves changes in the composite field', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.find(1)
        .exec()
        .then(function(record) {
          record.composite_attribute.foo = 2
          record.second_one = { bar: 'hello' }

          return record.save().then(function() {
            return AttributeTest.find(1)
              .exec()
              .then(function(record) {
                record.toJson().should.be.eql({
                  id: 1,
                  composite_attribute: {
                    foo: 2,
                    bar: 'foo'
                  },
                  second_one: {
                    foo: null,
                    bar: 'hello'
                  }
                })
              })
          })
        })
    })
  })

  it('changes only composite field changes - not the whole field', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.find(1)
        .exec()
        .then(function(record) {
          record.composite_attribute.foo = 2
          record.composite_attribute.bar = 'abc'

          delete record.composite_attribute.changes.bar // ignore change

          return record.save().then(function() {
            return AttributeTest.find(1)
              .exec()
              .then(function(record) {
                record.toJson().should.be.eql({
                  id: 1,
                  composite_attribute: {
                    foo: 2,
                    bar: 'foo'
                  },
                  second_one: {
                    foo: null,
                    bar: 'hello'
                  }
                })
              })
          })
        })
    })
  })

  it('creates a new record', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.create({
        composite_attribute: {
          bar: 'text'
        },
        second_one: {
          bar: 'foo'
        }
      }).then(function() {
        return AttributeTest.find(3)
          .exec()
          .then(function(record) {
            record.toJson().should.be.eql({
              id: 3,
              composite_attribute: {
                foo: null,
                bar: 'text'
              },
              second_one: {
                foo: null,
                bar: 'foo'
              }
            })
          })
      })
    })
  })
})
