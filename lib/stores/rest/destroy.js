const debug = require('debug')('openrecord:destroy')

/*
 * RECORD
 */
exports.record = {
  /**
   * Destroy a record
   * @class Record
   * @method destroy
   *
   * @callback
   * @param {boolean} result - will be true if the destroy was successful
   * @this Record
   *
   * @return {Promise}
   */
  destroy: function() {
    const Utils = this.definition.store.utils
    var self = this
    var primaryKeys = this.definition.primaryKeys

    var options = Utils.clone(self.definition.actions['destroy'])

    for (var i = 0; i < primaryKeys.length; i++) {
      options.params[primaryKeys[i]] = this[primaryKeys[i]]
    }

    Utils.applyParams(options)

    return self
      .callInterceptors('beforeDestroy', [self, options])
      .then(function() {
        return self.model.definition.store.connection.delete(options.url)
      })
      .then(function(result) {
        debug('delete ' + options.url)
        // var validationErrors = obj[self.errorParam || 'error']
        // if(typeof validationErrors === 'object' && Object.keys(validationErrors) > 0){
        //   this.errors.set(validationErrors)
        //   return resolve(false)
        // }
        var data = result.data[this.rootParam || 'data']

        if (data) {
          self.set(data)
        }

        return self.callInterceptors('afterDestroy', [self, options])
      })
      .then(function(record) {
        record.__exists = false
        return record
      })
  }
}
