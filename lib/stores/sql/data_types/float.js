const validator = require('validator')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'float',
      function(value) {
        if (value === null) return null
        if (value === '') return null
        return validator.toFloat(value + '')
      },
      {
        migration: 'float',
        operators: {
          defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
        }
      }
    )
  }
}
