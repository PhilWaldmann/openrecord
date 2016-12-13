var DeleteTreeControl = require('ldapjs').DeleteTreeControl;

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
  destroy: function(resolve, reject, options){
    var self = this;

    var options = options || {};

    return self.promise(function(resolve, reject){

      self.callInterceptors('beforeDestroy', [self, options], function(okay){
        if(okay){
          self.model.definition.store.connection.del(self.dn, options.controls || [], function(err){

            if(err){
              err = self.definition.store.convertLdapErrorToValidationError(self, err);
              if(err) return reject(err);
              return resolve(false);
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
  },



  destroyAll: function(resolve, reject){
    this.destroy(resolve, reject, {
      controls: [new DeleteTreeControl()]
    });
  }
};
