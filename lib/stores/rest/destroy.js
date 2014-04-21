var Utils = require('../../utils');
var Helper = require('./helper');


/*
 * RECORD
 */
exports.record = {
  
  
  /**
   * Destroy a record
   * @section Record
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
    var primary_keys = this.definition.primary_keys;  
    
    var options = Utils.clone(self.definition.actions['destroy']);
    
    for(var i = 0; i < primary_keys.length; i++){
      options.params[primary_keys[i]] = this[primary_keys[i]];
    }
  
    Helper.applyParams(options);
    
    return self.promise(function(resolve, reject){
    
      self.callInterceptors('beforeDestroy', [self, options], function(okay){
        if(okay){
          self.model.definition.store.connection.del(options.path, function(err, req, res, obj){

            err = err || obj[self.errorParam || 'error'];
          
            if(err){
              return reject(err);
            }
          
            var data = obj[this.rootParam || 'data'];
          
            if(data){
              self.set(data);
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