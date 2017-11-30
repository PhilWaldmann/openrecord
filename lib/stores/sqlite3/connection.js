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
      dialect: 'sqlite3',
      connection: {
        filename: this.config.file
      },
      useNullAsDefault: true
    })
  },

  close: function(){

  }
}
