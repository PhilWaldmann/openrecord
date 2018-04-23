exports.store = {
  mixinCallback: function() {
    this.addType(
      'object_class',
      {
        read: function(value) {
          /* istanbul ignore if */
          if (value === null) return null
          if (!Array.isArray(value)) value = value.split(',')

          return value
        },
        write: function(value) {
          /* istanbul ignore if */
          if (value === null) return null
          return value
        }
      },
      {
        array: true,
        operators: {
          default: 'eq',
          defaults: ['eq', 'not']
        }
      }
    )
  }
}
