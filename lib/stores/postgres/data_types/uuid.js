const validator = require('validator')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'uuid',
      function(value) {
        if (value === null) return null
        return validator.toString(value + '')
      },
      {
        migration: ['uuid'],
        operators: {
          defaults: ['eq', 'not', 'like', 'ilike']
        }
      }
    )
  }
}
