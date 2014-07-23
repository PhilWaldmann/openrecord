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
    var self = this.chain();
    
    self.setInternal('transaction', transaction);
    
    return self;
  }
};


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
    var self = this;
    
    if(typeof options == 'function'){
      callback = options;
      options = {};
    }
    
    if(options.transaction){
      options.commit = false;
      callback(options.transaction);
    }else{
      options.transaction_promise = this.definition.store.connection.transaction(function(transaction){
         options.transaction = transaction;
         callback(transaction);
         self.logger.info('commit'); 
       }).catch(function(e){
         //TODO: do something with e.g. 'afterSave' rollback message!?!
         self.logger.info('rollback'); 
       });
    }
  }
};





/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(query){
      var transaction = this.getInternal('transaction');
      
      if(transaction){
        query.transacting(transaction);
      }
      
      return true;
    }, -80);
    
  }
};