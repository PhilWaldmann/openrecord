exports.migration = {
  enum: function(name, values) {
    if (Array.isArray(values)) {
      var enumValues = values
        .map(function(v) {
          return `'${v}'`
        })
        .join(', ')
      this.raw(`CREATE TYPE ${name} AS ENUM (${enumValues})`)
    } else {
      var options = values || {}
      options.custom = function(table) {
        return table.enum(name, options.values, options)
      }
      this._addColumnTypeFn('enum').apply(this, arguments)
    }
  }
}
