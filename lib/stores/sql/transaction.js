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
  transaction: function(transaction){
    var self = this.chain()

    self.setInternal('transaction', transaction)

    return self
  },

  getExecOptions: function(){
    var transaction = this.getInternal('transaction')

    return this.query({transaction: transaction})
  }
}


/*
 * RECORD
 */
exports.record = {
  /**
   * TODO:... write documentation
   *
   * @class Record
   * @method transaction
   * @param {object} transaction - The transaction object
   *
   */
  transaction: function(options, callback){
    var self = this

    if(typeof options === 'function'){
      callback = options
      options = {}
    }

    if(options.transaction){
      return callback(options.transaction)
    }else{
      return this.definition.store.connection.transaction(function(transaction){
        options.transaction = transaction
        return callback(transaction)
      })
      .then(function(){
        self.logger.info('commit')
      })
      .catch(function(e){
        // TODO: do something with e.g. 'afterSave' rollback message!?!
        self.logger.info('rollback')
        throw e
      })
    }
  }
}
