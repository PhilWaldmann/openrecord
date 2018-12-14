const debug = require('debug')('openrecord:transaction')

/*
 * MODEL
 */
exports.model = {
  /**
   * Add the current query into a transaction
   *
   * @class Model
   * @method transaction
   * @param {object} transaction - The transaction object
   *
   * @return {Collection}
   */
  useTransaction: function(transaction) {
    var self = this.chain()

    self.setInternal('transaction', transaction)

    return self
  },

  getExecOptions: function() {
    var transaction = this.getInternal('transaction')

    return this.query({ transaction: transaction })
  }
}

/*
 * RECORD
 */
exports.store = {
  /**
   * TODO:... write documentation
   *
   * @class Record
   * @method transaction
   * @param {object} transaction - The transaction object
   *
   */
  startTransaction: function(options, callback) {
    // var self = this

    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    if (options.transaction) {
      return callback(options.transaction)
    } else {
      return this.connection
        .transaction(function(transaction) {
          options.transaction = transaction
          return callback(transaction)
        })
        .then(function(result) {
          debug('commit')
          return result
        })
        .catch(function(e) {
          // TODO: do something with e.g. 'afterSave' rollback message!?!
          debug('rollback')
          throw e
        })
    }
  }
}
