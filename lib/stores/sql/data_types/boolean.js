exports.store = {
  mixinCallback: function() {
    this.addType(
      'boolean',
      function(value) {
        if (value === null) return null
        if (value === 'f') return false
        if (value === '0') return false
        if (value === 'false') return false
        if (value === '') return false
        if (value === 0) return false
        if (value === false) return false
        return true
      },
      {
        migration: 'boolean',
        operators: {
          defaults: ['eq', 'not']
        }
      }
    )
  }
}
