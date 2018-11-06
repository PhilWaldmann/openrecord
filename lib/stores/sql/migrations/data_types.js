exports.migration = {
  mixinCallback: function() {
    var self = this

    for (var i in this.store.attributeTypes) {
      if (this.store.attributeTypes.hasOwnProperty(i)) {
        var type = this.store.attributeTypes[i]

        if (!type.migration) continue
        if (!Array.isArray(type.migration)) type.migration = [type.migration]

        for (var d = 0; d < type.migration.length; d++) {
          if (typeof type.migration[d] === 'object') {
            for (var name in type.migration[d]) {
              self[name] = self._addColumnTypeFn(type.migration[d][name])
            }
          } else {
            self[type.migration[d]] = self._addColumnTypeFn(type.migration[d])
          }
        }
      }
    }
  },

  _defineColumnTypeFn: function(type, name, options) {
    var self = this

    if (options.primary) self.primary.push(name)

    return function(table) {
      if (type === 'datetime') {
        // TODO: better solution?!
        type = 'dateTime'
      }

      var fn = table[type]
      var column
      if (typeof options.custom === 'function') {
        column = options.custom(table)
      } else if (typeof fn === 'function') {
        column = fn.call(table, name)
      } else {
        column = table.specificType(name, type)
      }

      self.setColumnOptions(column, options)
    }
  },

  _addColumnTypeFn: function(type) {
    var self = this
    return function(table, name, options) {
      if (typeof table === 'string' && typeof name === 'string') {
        options = options || {}

        // add column to existing table
        self.addColumn(table, self._defineColumnTypeFn(type, name, options))
      } else {
        options = name || {}
        name = table

        // inside a createTable()
        self.fields.push(self._defineColumnTypeFn(type, name, options))
      }
    }
  },

  increments: function() {
    this._addColumnTypeFn('increments').apply(this, arguments)
  },

  enum: function(name, options) {
    options = options || {}
    options.custom = function(table) {
      return table.enum(name, options.values, options)
    }
    this._addColumnTypeFn('enum').apply(this, arguments)
  },

  type: function(type, name, options) {
    this._addColumnTypeFn(type).call(this, name, options)
  }
}
