/*
 * RECORD
 */
exports.record = {
  
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

          query.transacting(options.transaction).where(condition).delete().exec(function(err, result){
            if(err){
              throw new Error(err); //TODO Error handling
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

  }
  
};

