const validator = require('validator')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'bigint',
      function(value) {
        if (value === null) return null
        if (value === '') return null
        return validator.toInt(value + '')
      },
      {
        migration: 'bigint',
        operators: {
          defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
        }
      }
    )
  }
}
