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

  _defineColumnTypeFn: function(type, name, ...args) {
    var self = this
    var options = typeof args[args.length - 1] === 'object' ? args.pop() || {} : {}

    // use trailing '!' on field name to indicate 'not null'
    if (name[name.length - 1] === '!') {
      name = name.slice(0, -1)
      options.null = false
    }

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
        column = fn.call(table, name, ...args)
      } else {
        column = table.specificType(name, type)
      }

      self.setColumnOptions(column, options)
    }
  },

  _addColumnTypeFn: function(type) {
    var self = this

    return function(...args) {
      if (typeof args[0] === 'string' && typeof args[1] === 'string') {
        var table = args.shift()

        // add column to existing table
        self.addColumn(table, self._defineColumnTypeFn(type, ...args))
      } else {

        // inside a createTable()
        self.fields.push(self._defineColumnTypeFn(type, ...args))
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

  type: function(type, ...args) {
    this._addColumnTypeFn(type).call(this, ...args)
  },

  // used to reference another table
  id: function() {
    this._addColumnTypeFn('integer').apply(this, arguments)
  },

  // not a data-type, but fits nicely with createTable
  index: function() {
    this._addColumnTypeFn('index').apply(this, arguments)
  },

  // not a data-type, but fits nicely with createTable
  unique: function() {
    this._addColumnTypeFn('unique').apply(this, arguments)
  }
}
