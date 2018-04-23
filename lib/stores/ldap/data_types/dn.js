exports.store = {
  mixinCallback: function() {
    const Utils = this.utils

    this.addType(
      'dn',
      {
        read: function(value) {
          /* istanbul ignore if */
          if (value === null) return null
          return Utils.normalizeDn(value)
        },
        input: function(value) {
          /* istanbul ignore if */
          if (value === null) return null
          return Utils.normalizeDn(value, false) // of change the dn on our side, we wont lower case them => writes
        },
        write: function(value) {
          /* istanbul ignore if */
          if (value === null) return null
          return value
        }
      },
      {
        operators: {
          default: 'eq',
          defaults: ['eq']
        }
      }
    )
  }
}
