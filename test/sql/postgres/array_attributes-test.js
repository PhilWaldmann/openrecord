var path = require('path')
var Store = require('../../../store/postgres')

describe('Postgres: Array Attributes', function() {
  var store
  var database = 'array_attributes_test'

  before(function(next) {
    this.timeout(5000)
    beforePG(database, ['CREATE EXTENSION IF NOT EXISTS hstore'], next)
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

    store.Model('ArrayTest', function() {})
  })

  after(function(next) {
    afterPG(database, next)
  })

  var testValues = {
    integer: {
      attr: 'int_arr',
      testValues: [
        {
          input: '22',
          output: [22]
        },
        {
          input: ['22', '13A'],
          output: [22, 13]
        }
      ]
    },

    float: {
      attr: 'float_arr',
      testValues: [
        {
          input: '22.5',
          output: [22.5]
        },
        {
          input: ['22.5', '13.77A'],
          output: [22.5, 13.77]
        }
      ]
    },

    boolean: {
      attr: 'bool_arr',
      testValues: [
        {
          input: 'true',
          output: [true]
        },
        {
          input: ['true', '1', 'false', ''],
          output: [true, true, false, false]
        }
      ]
    },

    date: {
      attr: 'date_arr',
      testValues: [
        {
          input: '2014-12-24',
          output: ['2014-12-24']
        },
        {
          input: ['2014-12-24', new Date('2014-12-25')],
          output: ['2014-12-24', '2014-12-25']
        }
      ]
    },

    datetime: {
      attr: 'datetime_arr',
      testValues: [
        {
          input: '2014-12-24 12:00:01',
          output: [new Date('2014-12-24 12:00:01')]
        },
        {
          input: ['2014-12-24 12:00:01', '2014-12-25 15:22:55'],
          output: [
            new Date('2014-12-24 12:00:01'),
            new Date('2014-12-25 15:22:55')
          ]
        }
      ]
    },

    time: {
      attr: 'time_arr',
      testValues: [
        {
          input: '12:00:01',
          output: ['12:00:01']
        },
        {
          input: ['12:00:01', '15:22'],
          output: ['12:00:01', '15:22:00']
        }
      ]
    },

    string: {
      attr: 'str_arr',
      testValues: [
        {
          input: 2225151,
          output: ['2225151']
        },
        {
          input: [2225151, 'foo'],
          output: ['2225151', 'foo']
        }
      ]
    }
  }

  for (var type in testValues) {
    ;(function(type, attr) {
      it('does have the ' + type + ' array attribute', function() {
        return store.ready(function() {
          var ArrayTest = store.Model('ArrayTest')
          ArrayTest.definition.attributes[attr].type.name.should.be.equal(
            type + '_array'
          )
        })
      })

      it('casts to ' + type + ' array', function() {
        return store.ready(function() {
          var ArrayTest = store.Model('ArrayTest')

          for (var i = 0; i < testValues[type].testValues; i++) {
            ArrayTest.definition.attributes[attr].type.cast
              .read(testValues[type].testValues[i].input)
              .should.be.eql(testValues[type].testValues[i].output)
          }
        })
      })

      it('can write and read ' + type + ' array values', function() {
        return store.ready(function() {
          var ArrayTest = store.Model('ArrayTest')
          var tmp = {}

          tmp[attr] = testValues[type].testValues[1].input

          return ArrayTest.create(tmp).then(function(result) {
            return ArrayTest.find(result.id).exec(function(record) {
              record[attr].should.be.eql(testValues[type].testValues[1].output)
            })
          })
        })
      })
    })(type, testValues[type].attr)
  }

  it('query ({int_arr: [22]})', function() {
    return store.ready(function() {
      var ArrayTest = store.Model('ArrayTest')

      return ArrayTest.where({ int_arr: [22] })
        .count()
        .exec(function(count) {
          count.should.be.equal(1)
        })
    })
  })

  it('query ({int_arr_in: [22]})', function() {
    return store.ready(function() {
      var ArrayTest = store.Model('ArrayTest')

      return ArrayTest.where({ int_arr_in: [22] })
        .count()
        .exec(function(count) {
          count.should.be.equal(1)
        })
    })
  })

  it('query ({int_arr: 22})', function() {
    return store.ready(function() {
      var ArrayTest = store.Model('ArrayTest')

      return ArrayTest.where({ int_arr: 22 })
        .count()
        .exec(function(count) {
          count.should.be.equal(1)
        })
    })
  })
})
