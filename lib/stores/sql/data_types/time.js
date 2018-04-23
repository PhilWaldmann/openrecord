const parse = require('date-fns/parse')
const format = require('date-fns/format')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'time',
      {
        read: function(value) {
          return value
        },
        input: function(value) {
          if (value === null) return null
          var dt

          if (typeof value === 'string') {
            dt = parse('2000-01-01 ' + value)
          } else {
            dt = parse(value)
          }

          return format(dt, 'HH:mm:ss')
        },
        write: function(value) {
          return value
        },
        output: function(value) {
          return value
        }
      },
      {
        migration: 'time',
        operators: {
          defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
        }
      }
    )
  }
}
