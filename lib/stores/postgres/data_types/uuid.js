exports.store = {
  mixinCallback: function() {
    this.addType(
      'uuid',
      function(value) {
        if (value === null) return null
        if (value === undefined) return null
        return value.toString()
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
