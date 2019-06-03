exports.store = {
  // TODO: V2.1. probably use https://github.com/bendrucker/postgres-interval
  mixinCallback: function() {
    this.addType(
      'interval',
      function(value) {
        if (value === null) return null
        if (value === undefined) return null
        return value.toString()
      },
      {
        migration: ['interval'],
        operators: {
          defaults: ['eq', 'not']
        }
      }
    )
  }
}
