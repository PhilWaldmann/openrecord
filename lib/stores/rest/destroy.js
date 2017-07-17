var Utils = require('../../utils')


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
    var self = this
    var primaryKeys = this.definition.primary_keys

    var options = Utils.clone(self.definition.actions['destroy'])

    for(var i = 0; i < primaryKeys.length; i++){
      options.params[primaryKeys[i]] = this[primaryKeys[i]]
    }

    Utils.applyParams(options)

    return self.promise(function(resolve, reject){
      self.callInterceptors('beforeDestroy', [self, options], function(okay){
        if(okay){
          self.model.definition.store.connection.del(options.path, function(err, req, res, obj){
            if(err){
              return reject(err)
            }

            var validationErrors = obj[self.errorParam || 'error']
            if(typeof validationErrors === 'object' && Object.keys(validationErrors) > 0){
              this.errors.set(validationErrors)
              return resolve(false)
            }

            var data = obj[this.rootParam || 'data']

            if(data){
              self.set(data)
            }

            self.callInterceptors('afterDestroy', [self, options], function(okay){
              resolve(okay)
            }, reject)
          })
        }else{
          resolve(false)
        }
      }, reject)
    }, resolve, reject)
  }
}
