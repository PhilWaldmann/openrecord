var Store = require('../../store');

exports.definition = {
  mixinCallback: function(){
    var self = this;

    this.onFind(function(query, data, next){
      query.asCallback(function(err, resp) {

        self.logger.info(query.toString());

        if(err) data.error = new Store.SQLError(err);
        data.result = resp;

        next();

      });
    });
  }
}


/*
 * MODEL
 */
exports.model = {

  getExecOptions: function(){
    return this.query;
  },


  toSql: function(callback){
    var sql;
    var query = this.query;

    if(typeof callback !== 'function') return;

    //make async?
    this.callInterceptors('beforeFind', [query], function(){
      sql = query.toString();
      sql = sql.replace(/`/g, '\"').replace(/'(\d+)'/g, '$1');

      callback(sql);
    });
  }

};
