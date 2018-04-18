const DeleteTreeControl = require('./controls/tree_delete')

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
    var self = this

    options = options || {}

    return self.callInterceptors('beforeDestroy', [self, options])
    .then(function(){
      return new Promise(function(resolve, reject){
        self.model.definition.store.connection.del(self.dn, options.controls || [], function(err){
          if(err) return reject(self.definition.store.convertLdapErrorToValidationError(self, err))

          resolve(
            self.callInterceptors('afterDestroy', [self, options])
          )
        })
      })
    })
    .then(resolve, reject)
  },



  destroyAll: function(resolve, reject){
    return this.destroy(resolve, reject, {
      controls: [new DeleteTreeControl()]
    })
  }
}
