const Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  connect: function() {
    this.connection = Knex({
      client: 'sqlite3',
      connection: this.config.connection || {
        filename: this.config.file
      },
      useNullAsDefault: true
    })
  },

  close: function(callback) {
    if (!this.connection) return callback ? callback() : null
    this.connection.client.destroy(callback)
  }
}
