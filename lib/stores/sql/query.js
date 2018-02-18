/*
 * DEFINITION
 */
exports.definition = {
  query: function(options){
    if(!options) options = {}
    var connection = options.transaction || this.store.connection

    return connection(this.table_name)
  }
}


exports.chain = {
  query: function(options){
    if(!options) options = {}

    var connection = options.transaction || this.definition.store.connection

    var query = this.getInternal('query')
    if(!query){
      query = connection(this.definition.table_name)
      this.setInternal('query', query)
    }

    return query
  }
}
