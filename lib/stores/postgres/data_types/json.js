exports.store = {
  mixinCallback: function() {
    var store = this

    this.addType(
      'json',
      {
        output: function(val) {
          if (!val) return {}
          return val
        },

        read: function(val) {
          if (val instanceof Object) return val
          if (val instanceof String) return JSON.parse(val)
          if (val === null) return null

          return val
        },

        write: function(object) {
          if (object === null) return null
          if (typeof object === 'string') return object

          return JSON.stringify(object)
        }
      },
      {
        array: true,
        migration: ['json', 'jsonb'],
        operators: {
          defaults: ['eq'],

          eq: {
            defaultMethod: function(attr, value, query, cond) {
              var key = Object.keys(value)[0]
              value = value[key]
              query.whereRaw(attr + "->>'" + key + "' = ?", [value])
            }
          }
        },

        sorter: function(name) {
          var tmp = name.match(/(.+)\.([a-zA-Z_-]+)$/)
          if (tmp) {
            return store.connection.raw(tmp[1] + "->>'" + tmp[2] + "'")
          }
          return name
        }
      }
    )
  }
}
