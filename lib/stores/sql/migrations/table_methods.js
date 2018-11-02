exports.migration = {
  createTable: function (name, options, fn) {
    var self = this
    var fields = []
    var primary = []
    var primaryViaAutpId = false

    this.fields = fields
    this.primary = primary

    if (typeof options === 'function') {
      fn = options
      options = {}
    }

    options = options || {}

    // add the id column, if not disabled
    if (options.id !== false) {
      this.increments('id', {
        comment: 'unique ' + name + ' identifier'
      })

      primaryViaAutpId = true
    }

    // Call custom createTable() method
    if (typeof fn === 'function') {
      fn.call(this)
    }

    this.queue.push(function () {
      return self.connection.schema.createTable(name, function (table) {
        for (var i = 0; i < fields.length; i++) {
          if (typeof fields[i] === 'function') {
            fields[i].call(self, table)
          }
        }

        // set primary keys
        if (primary.length > 0) {
          if (primaryViaAutpId) {
            throw new Error('Openrecord automatically adds an `id` column to your table. If you want to use your own primary keys, set the `id` option to false. See: https://openrecord.js.org/#/migrations?id=createtablename-options-fn')
          }
          table.primary(primary)
        }

        if (options.comment) {
          table.comment(options.comment)
        }
      })
    })

    return this
  },

  renameTable: function (from, to) {
    var self = this

    this.queue.push(function (next) {
      return self.connection.schema.renameTable(from, to)
    })

    return this
  },

  removeTable: function (table) {
    var self = this

    this.queue.push(function (next) {
      return self.connection.schema.dropTableIfExists(table)
    })

    return this
  },

  createIndex: function (tableName, columns, options) {
    var self = this
    options = options || {}

    this.queue.push(function (next) {
      return self.connection.schema.alterTable(tableName, function (table) {
        table.index(columns, options.name, options.type)
      })
    })

    return this
  },


  dropIndex: function (tableName, columns, options) {
    var self = this
    options = options || {}

    this.queue.push(function (next) {
      return self.connection.schema.alterTable(tableName, function (table) {
        table.dropIndex(columns, options.name)
      })
    })

    return this
  },


  createUniqueIndex: function (tableName, columns, options) {
    var self = this
    options = options || {}

    this.queue.push(function (next) {
      return self.connection.schema.alterTable(tableName, function (table) {
        table.unique(columns, options.name)
      })
    })

    return this
  },


  dropUniqueIndex: function (tableName, columns, options) {
    var self = this
    options = options || {}

    this.queue.push(function (next) {
      return self.connection.schema.alterTable(tableName, function (table) {
        table.dropUnique(columns, options.name)
      })
    })

    return this
  }
}