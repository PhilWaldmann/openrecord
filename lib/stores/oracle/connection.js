var Knex = require('knex')

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.connection = Knex({
      dialect: 'oracledb',
      connection: {
        user: this.config.user || this.config.username,
        password: this.config.password,
        charset: this.config.charset,
        connectString: this.config.host + '/' + this.config.database
      }
    })
  },

  close: function(callback){
    this.connection.client.destroy(callback)
  }
}
