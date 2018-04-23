exports.store = {
  mixinCallback: function() {
    this.use(function() {
      if (this.config.autoLoad) return this.loadAllTables()
    }, 100)
  },

  loadAllTables: function() {
    const self = this
    const sql = 'SELECT table_name FROM user_tables'

    return this.connection.raw(sql).then(function(tableNames) {
      tableNames.forEach(function(row) {
        var tableName = row.TABLE_NAME
        self.Model(self.utils.getModelName(tableName), function() {
          // Empty model definition!
        })
      })
    })
  }
}
