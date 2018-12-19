const Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  connect: function() {
    const pg = require('pg')

    // convert e.g. count(*) to integer instead of a string
    // see https://github.com/tgriesser/knex/issues/387
    pg.types.setTypeParser(20, 'text', parseInt)

    var connectionConfig = {
      client: 'pg',
      connection: this.config.connection || {
        host: this.config.host || this.config.hostname,
        port: this.config.port,
        user: this.config.user || this.config.username,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset
      }
    }
    if (this.config.pool) connectionConfig['pool'] = this.config.pool

    this.connection = Knex(connectionConfig)
    this.supportsReturning = true
  },

  close: function(callback) {
    if (!this.connection) return callback ? callback() : null
    this.connection.client.destroy(callback)
  }
}
