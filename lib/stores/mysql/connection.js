const Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  connect: function(){
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
    this.supportsReturning = true
  },

  close: function(callback){
    this.connection.client.destroy(callback)
  }
}
