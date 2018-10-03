const Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  connect: function() {
    this.connection = Knex({
      dialect: 'sqlite3',
      connection: {
        filename: this.config.file
      },
      useNullAsDefault: true
    })
  },

  close: function(callback) {
    if(!this.connection) return callback ? callback() : null
    this.connection.client.destroy(callback)
  }
}
