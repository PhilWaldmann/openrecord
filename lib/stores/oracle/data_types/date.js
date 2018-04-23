const parse = require('date-fns/parse')
const format = require('date-fns/format')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'date',
      {
        read: function(value) {
          if (value === null) return null
          return format(parse(value), 'YYYY-MM-DD')
        },
        input: function(value) {
          if (value === null) return null
          return format(parse(value), 'YYYY-MM-DD')
        },
        write: function(value) {
          return new Date(value)
        },
        output: function(value) {
          return value
        },
        condition: function(value) {
          const self = this
          if (Array.isArray(value))
            return value.map(function(d) {
              return self.condition(d)
            })
          return new Date(value)
        }
      },
      {
        migration: 'date',
        operators: {
          defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
        }
      }
    )
  }
}
