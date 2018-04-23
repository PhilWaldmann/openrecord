exports.store = {
  mixinCallback: function() {
    this.use(function() {
      if (this.config.autoLoad) return this.loadAllTables()
    }, 100)
  },

  loadAllTables: function() {
    const self = this
    var schema = 'public'
    if (typeof this.config.autoLoad === 'string') schema = this.config.autoLoad

    const sql =
      "select table_name from information_schema.tables WHERE table_schema ='" +
      schema +
      "';"

    return this.connection.raw(sql).then(function(tableNames) {
      tableNames.rows.forEach(function(row) {
        self.Model(self.utils.getModelName(row.table_name), function() {
          // Empty model definition!
        })
      })
    })
  }
}
