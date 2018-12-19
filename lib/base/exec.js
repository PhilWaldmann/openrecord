exports.model = {
  /**
   * Executes the find
   *
   * @class Model
   * @method exec
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   */
  exec: function(resolve) {
    var self = this.chain()

    // if .find(null) was called
    if (self.getInternal('exec_null')) {
      return Promise.resolve(null)
    }

    var relation = self.getInternal('relation')

    if (relation && typeof relation.loadWithCollection === 'function') {
      const promise = relation.loadWithCollection(self)
      if (promise && promise.then) return promise.then(resolve)
    }

    var dataLoaded = self.getInternal('data_loaded')
    var options = self.getExecOptions()
    var data = {}

    if (dataLoaded) data.result = dataLoaded

    return self
      .callInterceptors('beforeFind', [options])
      .then(function() {
        return self.callInterceptors('onFind', [options, data], {
          executeInParallel: true
        })
      })
      .then(function() {
        return self.callInterceptors('afterFind', [data])
      })
      .then(function() {
        if (typeof resolve === 'function') return resolve(data.result)
        return data.result
      })
  },

  then: function(resolve, reject) {
    var self = this.chain()

    if (self._isResolved()) {
      const clone = self.clone({
        exclude: [
          'query',
          'relation_cache',
          'relation_to',
          'relation',
          '__clear_only',
          '__resolving'
        ]
      })
      clone.push.apply(clone, self) // push instead of add, because add will trigger relation methods that was done for the original collection before.

      // collection is resolved, remove the `then` function to act as an array
      // this is not a good way! But at the moment it's the easiest!
      // We probably should not return the collection as a result. A normal Array would be better, right?
      Object.defineProperty(clone, 'then', {
        value: undefined
      })

      if (typeof resolve !== 'function') return clone
      return resolve(clone)
    }

    if (!self.__resolving || self.__multi_resolver) {
      self.__resolving = self.exec()
    }

    return self.__resolving.then(resolve, reject)
  },

  getExecOptions: function() {
    return {}
  }
}
