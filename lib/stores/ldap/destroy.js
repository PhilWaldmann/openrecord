/*
 * RECORD
 */
exports.record = {
  
  
  /**
   * Destroy a record
   * @class Record
   * @method destroy
   * @param {function} callback - The destroy callback
   *
   * @callback
   * @param {boolean} result - will be true if the destroy was successful
   * @this Record
   *
   * @return {Record}
   */
  destroy: function(resolve, reject){
    var self = this;
    
    var options = {};
    
    return self.promise(function(resolve, reject){
    
      self.callInterceptors('beforeDestroy', [self, options], function(okay){
        if(okay){
          self.model.definition.store.connection.del(self[self.definition.dnAttribute], function(err){
          
            if(err){
              return reject(err);
            }
                    
            self.callInterceptors('afterDestroy', [self, options], function(okay){
              
              resolve(okay);     
              
            }, reject);
          });  

        }else{
          
          resolve(false);
        }
      }, reject);
    
    }, resolve, reject);
  }
};