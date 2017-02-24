var Knex = require('knex');
var pg = require('pg')

//convert e.g. count(*) to integer instead of a string
//see https://github.com/tgriesser/knex/issues/387
pg.types.setTypeParser(20, 'text', parseInt)

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){

    this.connection = Knex({
      dialect: 'pg',
      connection: {
        host     : this.config.host,
        port     : this.config.port,
        user     : this.config.user || this.config.username,
        password : this.config.password,
        database : this.config.database,
        charset  : this.config.charset
      }
    });
  },

  close: function(callback){
    this.connection.client.destroy(callback);
  }
};
