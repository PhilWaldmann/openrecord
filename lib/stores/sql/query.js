/*
 * DEFINITION
 */
exports.definition = {
  query: function(options) {
    if (!options) options = {}
    var connection = options.transaction || this.store.connection

    return connection(this.tableName)
  }
}

exports.chain = {
  query: function(options) {
    if (!options) options = {}

    var connection = options.transaction || this.definition.store.connection

    var query = this.getInternal('query')
    if (!query || options.force) {
      query = connection(this.definition.tableName)
      this.setInternal('query', query)
    }

    return query
  }
}
