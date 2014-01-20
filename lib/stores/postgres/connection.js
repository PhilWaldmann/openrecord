var Knex = require('knex');

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    
    var knex = Knex.initialize({
      client: 'pg',
      connection: {
        host     : '127.0.0.1',
        user     : 'your_database_user',
        password : 'your_database_password',
        database : 'myapp_test',
        charset  : 'utf8'
      }
    });
  }
}