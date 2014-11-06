var Knex = require('knex');

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    
    this.connection = Knex.initialize({
      client: 'mysql',
      connection: {
        host     : this.config.host,
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