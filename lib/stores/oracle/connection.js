var Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.connection = Knex({
      dialect: 'oracledb',
      connection: Object.assign({
        host: this.config.host,
        user: this.config.user || this.config.username,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset
      }, this.config.connection)
    })
  },

  close: function(callback){
    this.connection.client.destroy(callback)
  }
}
