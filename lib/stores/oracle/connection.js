var Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  connect: function() {
    this.connection = Knex({
      client: 'oracledb',
      connection: this.config.connection || {
        host: this.config.host || this.config.hostname,
        port: this.config.port,
        user: this.config.user || this.config.username,
        password: this.config.password,
        connectString: this.config.connectString
        // fetchAsString: [ 'number', 'clob' ],
        // pool: { min: 5, max: 5 }
        // database: this.config.database,
        // charset: this.config.charset
      }
    })
    this.supportsReturning = true
  },

  close: function(callback) {
    if (!this.connection) return callback ? callback() : null
    this.connection.client.destroy(callback)
  }
}
