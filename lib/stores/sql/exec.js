
exports.definition = {
  mixinCallback: function(){
    const Store = require('../../store')

    var self = this

    this.onFind(function(query, data){
      if(data.result) return

      return query
      .then(function(response) {
        self.logger.info(query.toString())
        data.result = response
      })
      .catch(function(error){
        self.logger.warn(query.toString())
        data.error = new Store.SQLError(error)
        throw data.error
      })
    })
  }
}


/*
 * MODEL
 */
exports.model = {

  getExecOptions: function(){
    return this.query()
  },


  toSql: function(callback){
    var sql
    var query = this.query()

    if(typeof callback !== 'function') return

    // make async?
    return this.callInterceptors('beforeFind', [query])
    .then(function(){
      sql = query.toString()

      if(process.env.NODE_ENV === 'test'){
        sql = sql.replace(/`/g, '"').replace(/'(\d+)'/g, '$1').replace(/ as /g, ' ')
      }

      return sql
    })
    .then(callback)
  }

}
