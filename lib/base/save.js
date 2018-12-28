/*
 * RECORD
 */
exports.record = {
  /**
   * Save the current record
   * @class Record
   * @method save
   */
  save: function(options) {
    var self = this
    options = options || {}

    if (typeof options === 'function') throw new Error('then!')
    return self
      .validate()
      .then(function() {
        return self._create_or_update(options)
      })
      .then(function() {
        // eliminate changes -> we just saved it to the database!
        self.changes = {}
      })
      .then(function() {
        return self
      })
  },

  update: function(data, options) {
    return this.set(data).save(options)
  },

  _create_or_update: function() {
    throw new Error('not implemented')
  }
}

/*
 * CHAIN
 */
exports.chain = {
  save: function(options) {
    const self = this
    var records = self

    if (options.ignore) {
      records = records.filter(function(record) {
        return options.ignore.indexOf(record) === -1
      })
    }

    return self
      ._runLazyOperation(options)
      .then(function() {
        return self.store.utils.parallel(
          records.map(function(record) {
            return record.save(options)
          })
        )
      })
      .then(function() {
        self._resolved()
        return self
      })
  }
}
