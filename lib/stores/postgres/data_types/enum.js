exports.migration = {
  enum: function(name, values) {
    var enumValues = values
      .map(function(v) {
        return `'${v}'`
      })
      .join(', ')
    this.raw(`CREATE TYPE ${name} AS ENUM (${enumValues})`)
  }
}
