/* istanbul ignore next */
exports.store = {
  mixinCallback: function() {
    const Utils = this.utils

    this.addType(
      'dn_array',
      {
        read: function(values) {
          if (values == null) return []
          if (!Array.isArray(values)) values = [values]
          return Utils.normalizeDn(values)
        },
        write: function(values) {
          if (!values) return []
          if (!Array.isArray(values)) values = [values]
          return values
        },
        input: function(values) {
          if (values == null) return []
          if (!Array.isArray(values)) values = [values]
          return Utils.normalizeDn(values)
        },
        output: function(values) {
          if (values === null) return []
          return values
        }
      },
      {
        array: true,
        defaults: {
          default: [],
          track_object_changes: true
        },
        operators: {
          default: 'eq',
          defaults: ['eq']
        }
      }
    )
  }
}
