const validator = require('validator')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'string',
      function(value) {
        if (value === null) return null
        return validator.toString(value + '')
      },
      {
        migration: ['string', 'text'],
        operators: {
          defaults: ['eq', 'not', 'like', 'ilike']
        }
      }
    )
  }
}
