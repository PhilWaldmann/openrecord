var GroupTypeBitmask = {
  BUILTIN_LOCAL_GROUP: 1,
  ACCOUNT_GROUP: 2,
  RESOURCE_GROUP: 4,
  UNIVERSAL_GROUP: 8,
  APP_BASIC_GROUP: 16,
  APP_QUERY_GROUP: 32,
  SECURITY_ENABLED: -2147483648
}

/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    this.addType(
      'group_type',
      {
        read: function(value) {
          if (typeof value === 'string') value = parseInt(value, 10)

          var obj = {}
          for (var attrName in GroupTypeBitmask) {
            obj[attrName] =
              (value & GroupTypeBitmask[attrName]) ===
              GroupTypeBitmask[attrName]
          }

          return obj
        },

        write: function(value) {
          if (!value) value = {}
          var bitmask = 0
          for (var attrName in GroupTypeBitmask) {
            if (value[attrName] === true) bitmask += GroupTypeBitmask[attrName]
          }
          return bitmask
        }
      },
      {
        binary: true,
        operators: {
          default: 'eq',
          defaults: ['eq', 'not']
        }
      }
    )
  }
}
