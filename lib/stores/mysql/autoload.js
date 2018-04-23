exports.store = {
  mixinCallback: function() {
    this.use(function() {
      if (this.config.autoLoad) return this.loadAllTables()
    }, 100)
  },

  loadAllTables: function() {
    const self = this
    const sql =
      "select TABLE_NAME from information_schema.tables WHERE TABLE_SCHEMA='" +
      this.config.database +
      "'"

    return this.connection.raw(sql).then(function(tableNames) {
      tableNames[0].forEach(function(row) {
        var tableName = row.TABLE_NAME
        self.Model(self.utils.getModelName(tableName), function() {
          // Empty model definition!
        })
      })
    })
  }
}
