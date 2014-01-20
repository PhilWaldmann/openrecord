var Knex = require('knex');

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.connection = Knex.initialize({
      client: 'sqlite3',
      connection: {
        filename: this.config.file
      }
    });
  }
};