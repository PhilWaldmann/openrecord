const Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    if(!this.config.disableAutoConnect) this.connect()
  },

  connect: function(){
    if(this.connection) this.close()
    this.connection = Knex({
      dialect: 'mysql',
      connection: {
        host: this.config.host,
        user: this.config.user || this.config.username,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset
      }
    })
  },

  close: function(callback){
    this.connection.client.destroy(callback)
  }
}
