var Store = require('../../store');

/*
 * RECORD
 */
exports.record = {
  
  
  /**
   * Destroy a record
   * @area Record
   * @method destroy
   * @param {function} callback - The destroy callback
   *
   * @callback
   * @param {boolean} result - will be true if the destroy was successful
   * @scope Record
   *
   * @return {Record}
   */
  destroy: function(options, callback){
    var self = this;
    var query = this.definition.query();
    var primary_keys = this.definition.primary_keys;  
    var condition = {};
          
    if(typeof options == 'function'){
      callback = options;
      options = {};
    }
          
    for(var i = 0; i < primary_keys.length; i++){
      condition[primary_keys[i]] = this[primary_keys[i]];
    }
    
    this.transaction(options, function(){
      
      self.callInterceptors('beforeDestroy', [options.transaction], function(okay){
        if(okay){        

          query.transacting(options.transaction).where(condition).delete().exec(function(err){
            if(err){
              return self.handleException(new Store.SQLError(err));
            }
                
            self.callInterceptors('afterDestroy', [self, options.transaction], function(okay){
              if(okay){
              
                if(options.commit !== false){
                  options.transaction.commit();
                }
              
                callback(true);
              }else{
                options.transaction.rollback();
                callback(false);
              }  
            });
          });  

        }else{
          options.transaction.rollback();
          callback(false);
        }
      });
      
    });
    
    return self;
  }
  
};

