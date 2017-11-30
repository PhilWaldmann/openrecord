const Knex = require('knex')
const pg = require('pg')

// convert e.g. count(*) to integer instead of a string
// see https://github.com/tgriesser/knex/issues/387
pg.types.setTypeParser(20, 'text', parseInt)

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    if(!this.config.disableAutoConnect) this.connect()
  },

  connect: function(){
    var connectionConfig = {
      dialect: 'pg',
      connection: this.config.connection || {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user || this.config.username,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset
      }
    }
    if(this.config.pool) connectionConfig['pool'] = this.config.pool

    if(this.connection) this.close()
    this.connection = Knex(connectionConfig)
  },

  close: function(callback){
    this.connection.client.destroy(callback)
  }
}
