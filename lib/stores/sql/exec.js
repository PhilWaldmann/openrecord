const debug = require('debug')('openrecord:exec')

exports.definition = {
  mixinCallback: function() {
    const Store = require('../../store')

    // var self = this

    this.onFind(function(query, data) {
      if (data.result) return

      // measure just the sql execution time
      const startTime = process.hrtime()

      return query
        .then(function(response) {
          const endTime = process.hrtime(startTime)
          const ms =
            parseInt((endTime[0] * 1e9 + endTime[1]) / 1000000 * 100) / 100
          debug('[' + ms + 'ms] ' + query.toString())

          data.result = response
        })
        .catch(function(error) {
          debug(query.toString())
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
  getExecOptions: function() {
    return this.query()
  },

  toSql: function(callback) {
    var sql
    var query = this.query()

    if (typeof callback !== 'function') return

    // make async?
    return this.callInterceptors('beforeFind', [query])
      .then(function() {
        sql = query.toString()

        if (process.env.NODE_ENV === 'test') {
          sql = sql
            .replace(/`/g, '"')
            .replace(/'(\d+)'/g, '$1')
            .replace(/ as /g, ' ')
        }

        return sql
      })
      .then(callback)
  }
}
