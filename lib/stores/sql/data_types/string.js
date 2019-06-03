exports.store = {
  mixinCallback: function() {
    this.addType(
      'string',
      function(value) {
        if (value === null) return null
        if (value === undefined) return null
        return value.toString()
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
