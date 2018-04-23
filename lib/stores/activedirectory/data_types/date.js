const parse = require('date-fns/parse')
const format = require('date-fns/format')
/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    this.addType(
      'date',
      {
        read: function(value) {
          if (value === null) return null
          return new Date(
            value.replace(
              /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\.(.{2})$/,
              '$1.$2.$3 $4:$5:$6.$7'
            )
          )
        },
        write: function(value) {
          if (value === null) return null
          return format(parse(value), 'YYYYMMDDHHmmss.S') + 'Z'
        },
        output: function(value) {
          if (value === null) return null
          return format(parse(value), 'YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        operators: {
          default: 'eq',
          defaults: ['eq', 'gt', 'gte', 'lt', 'lte', 'not']
        }
      }
    )
  }
}
