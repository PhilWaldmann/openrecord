exports.migration = {
  addColumn: function (table, columnFn) {
    var self = this
    var fields = (this.fields = [])

    if (typeof columnFn === 'function') {
      columnFn.call(self)
    }

    this.queue.push(function () {
      return self.connection.schema.table(table, function (table) {
        for (var i = 0; i < fields.length; i++) {
          if (typeof fields[i] === 'function') {
            fields[i].call(self, table)
          }
        }
      })
    })

    return this
  },

  renameColumn: function (table, from, to) {
    var self = this
    this.queue.push(function () {
      return self.connection.schema.table(table, function (table) {
        table.renameColumn(from, to)
      })
    })

    return this
  },

  removeColumn: function (table, name) {
    var self = this

    this.queue.push(function () {
      return self.connection.schema.table(table, function (table) {
        if (Array.isArray(name)) {
          table.dropColumns.apply(table, name)
        } else {
          table.dropColumn(name)
        }
      })
    })

    return this
  },

  setColumnOptions: function (column, options) {
    if (typeof column === 'string')
      throw new Error('first param needs to be a column object')

    if (options.unique) {
      column.unique()
    }

    if (options.default !== undefined) {
      if (typeof options.default === 'string' && options.default.toLowerCase() === 'now()') {
        options.default = this.connection.fn.now()
      }
      column.defaultTo(options.default)
    }

    if (options.notnull || options.not_null) {
      column.notNullable()
    }

    if (options.null === false) {
      column.notNullable()
    }

    if (options.references) {
      column.references(options.references)
    }

    if (options.unsigned) {
      column.unsigned()
    }

    if (options.comment) {
      column.comment(options.comment)
    }
  }
}