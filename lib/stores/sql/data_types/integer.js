const validator = require('validator')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'integer',
      function(value) {
        if (value === null) return null
        if (value === '') return null
        return validator.toInt(value + '')
      },
      {
        migration: 'integer',
        operators: {
          defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
        }
      }
    )
  }
}
