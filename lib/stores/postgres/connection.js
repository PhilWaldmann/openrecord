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

    this.connection = Knex.initialize({
      client: 'pg',
      connection: {
        host     : this.config.host,
        port     : this.config.port,
        user     : this.config.user,
        password : this.config.password,
        database : this.config.database,
        charset  : this.config.charset
      }
    });

    //knex overload...
    this.connection.client.Formatter.prototype.operators.push('is', 'is not');

  },

  close: function(callback){
    this.connection.client.pool.destroy(callback);
  }
};
