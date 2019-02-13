const debug = require('debug')('openrecord:destroy')

/*
 * RECORD
 */
exports.record = {
  /**
   * Destroy a record
   *
   * @class Record
   * @method destroy
   *
   *
   * @return {Record}
   */
  destroy: function(options) {
    const Store = require('../../store')

    var self = this
    var primaryKeys = this.definition.primaryKeys
    var condition = {}

    options = options || {}

    for (var i = 0; i < primaryKeys.length; i++) {
      condition[primaryKeys[i]] = this[primaryKeys[i]]
    }

    return self.store.startTransaction(options, function() {
      return self
        .callInterceptors('beforeDestroy', [self, options])
        .then(function() {
          var query = self.definition.query(options)

          return query
            .where(condition)
            .delete()
            .catch(function(error) {
              debug(query.toString())
              throw new Store.SQLError(error)
            })
            .then(function() {
              debug(query.toString())
            })
            .then(function() {
              return self.callInterceptors('afterDestroy', [self, options])
            })
            .then(function() {
              self.__exists = false
              return self
            })
        })
    })
  },

  /**
   * Deletes the record. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   *
   * @class Record
   * @method delete
   * @param {function} callback - The delete callback
   *
   * @callback
   * @param {boolean} result - will be true if the delete was successful
   * @this Record
   *
   * @return {Record}
   */
  delete: function(options, resolve, reject) {
    const Store = require('../../store')

    var self = this
    var query = this.definition.query(options)
    var primaryKeys = this.definition.primaryKeys
    var condition = {}

    if (typeof options === 'function') {
      reject = resolve
      resolve = options
      options = null
    }

    if (resolve) throw new Error('then')

    options = options || {}

    for (var i = 0; i < primaryKeys.length; i++) {
      condition[primaryKeys[i]] = self[primaryKeys[i]]
    }

    return query
      .where(condition)
      .delete(options)
      .catch(function(error) {
        debug(query.toString())
        throw new Store.SQLError(error)
      })
      .then(function() {
        debug(query.toString())
      })
      .then(resolve, reject)
  }
}

/*
 * MODEL
 */
exports.model = {
  /**
   * Deletes all records which match the conditions. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   *
   * @class Model
   * @method deleteAll
   * @alias delete
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @this Collection
   *
   * @return {Model}
   */
  delete: function(options) {
    return this.deleteAll(options)
  },
  deleteAll: function(options) {
    const Store = require('../../store')

    var self = this.chain()
    var limit = self.getInternal('limit')
    var offset = self.getInternal('offset')
    var joins = self.getInternal('joins')
    var singleResult = self.getInternal('single_result')
    var query = self.query(options)
    var findQuery = query
    var withSubquery = false

    if(!singleResult && (limit || offset || joins)){ // other possible query options?
      if(self.definition.primaryKeys.length > 1) throw new Error('Updates with limit, offset, joins ... are only supported for tables with a single primary key!')
      withSubquery = true
    }

    if(withSubquery){
      findQuery = self.query(Object.assign({force: true}, options))
    }


    return self
      .callInterceptors('beforeFind', [findQuery])
      .then(function() {
        if(withSubquery){
          query.whereIn(self.definition.primaryKeys[0], findQuery.select(self.definition.primaryKeys))
        }
        return query.delete()
      })
      .catch(function(error) {
        debug(query.toString())
        throw new Store.SQLError(error)
      })
      .then(function() {
        debug(query.toString())
      })
  },

  /**
   * Loads all records at first and calls destroy on every single record. All hooks are fired and relations will be deleted if configured via options `dependent`
   *
   * @class Model
   * @method destroyAll
   * @alias destroy
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @this Collection
   *
   * @return {Model}
   */
  destroy: function(options, resolve, reject) {
    return this.destroyAll(options, resolve, reject)
  },
  destroyAll: function(options, resolve, reject) {
    var self = this.chain()

    if (typeof options === 'function') {
      reject = resolve
      resolve = options
      options = null
    }

    if (resolve) throw new Error('then')
    if (options && options.transaction) {
      self.useTransaction(options.transaction)
    }

    return self
      .exec(function(records) {
        var tmp = []

        self.forEach(function(record) {
          tmp.push(function() {
            return record.destroy(options)
          })
        })

        return self.store.utils.series(tmp)
      })
      .then(resolve, reject)
  }
}
