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
       });
    }
  }
};

