exports.store = {
  mixinCallback: function() {
    this.use(function() {
      if (this.config.autoLoad) return this.loadAllTables()
    }, 100)
  },

  loadAllTables: function() {
    const self = this
    const sql = "SELECT name FROM sqlite_master WHERE type='table'"

    return this.connection.raw(sql).then(function(tableNames) {
      tableNames.forEach(function(row) {
        var tableName = row.name
        self.Model(self.utils.getModelName(tableName), function() {
          // Empty model definition!
        })
      })
    })
  }
}
