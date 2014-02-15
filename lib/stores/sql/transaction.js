/*
 * MODEL
 */
exports.model = {
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
  transaction: function(options, callback){
    if(typeof options == 'function'){
      callback = options;
      options = {};
    }
    
    if(options.transaction){
      options.commit = false;
      callback(options.transaction);
    }else{
       this.definition.store.connection.transaction(function(transaction){
         options.transaction = transaction;
         callback(transaction);
       }).catch(function(e){
         //TODO: do something with e.g. 'afterSave' rollback message!?!
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