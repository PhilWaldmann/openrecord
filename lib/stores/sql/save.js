const debug = require('debug')('openrecord:save')

/*
 * RECORD
 */
exports.record = {
  _create_or_update: function(options) {
    var self = this

    if (this.__chainedModel) {
      var transaction = this.__chainedModel.getInternal('transaction')
      if (transaction) options.transaction = transaction
    }

    return this.store.startTransaction(options, function() {
      return self
        .callInterceptors('beforeSave', [self, options])
        .then(function() {
          if (self.__exists) return self._update(options)
          return self._create(options)
        })
        .then(function() {
          return self.callInterceptors('afterSave', [self, options])
        })
    })
  },

  _update: function(options) {
    const Store = require('../../store')

    var self = this
    var query = this.definition.query(options)
    var primaryKeys = this.definition.primaryKeys
    var condition = {}

    for (var i = 0; i < primaryKeys.length; i++) {
      condition[primaryKeys[i]] = this[primaryKeys[i]]
    }

    return this.callInterceptors('beforeUpdate', [self, options]).then(
      function() {
        var values = {}
        var changes = self.getChangedValues()
        var hasChanges = false

        for (var name in self.model.definition.attributes) {
          var attr = self.model.definition.attributes[name]

          if (attr.persistent && changes.hasOwnProperty(name)) {
            // if attribute has `getChangedValues` (e.g. composite type)
            if (
              changes[name] &&
              typeof changes[name].getChangedValues === 'function' &&
              changes[name].definition
            ) {
              var subchanges = changes[name].getChangedValues()
              for (var subname in subchanges) {
                if (subchanges.hasOwnProperty(subname)) {
                  values[name + '.' + subname] = changes[name].definition.cast(
                    subname,
                    subchanges[subname],
                    'write',
                    changes[name]
                  )
                  hasChanges = true
                }
              }
            } else {
              values[name] = self.model.definition.cast(
                name,
                changes[name],
                'write',
                self
              )
              hasChanges = true
            }
          }
        }

        var afterUpdate = function() {
          return self.callInterceptors('afterUpdate', [self, options])
        }

        // call afterUpdate hook even there was nothing to save for the current record!
        if (!hasChanges) return afterUpdate()

        return query
          .where(condition)
          .update(values)
          .catch(function(error) {
            debug(query.toString())
            throw new Store.SQLError(error)
          })
          .then(function(result) {
            debug(query.toString())
            return afterUpdate()
          })
      }
    )
  },

  _create: function(options) {
    const Store = require('../../store')

    var self = this
    var query = this.definition.query(options)

    var primaryKeys = this.definition.primaryKeys
    var primaryKey = primaryKeys[0]

    return this.callInterceptors('beforeCreate', [self, options]).then(
      function() {
        var values = {}
        var changes = self.getChangedValues()

        for (var name in self.model.definition.attributes) {
          var attr = self.model.definition.attributes[name]

          if (attr.persistent && changes.hasOwnProperty(name)) {
            values[name] = self.model.definition.cast(
              name,
              changes[name],
              'write',
              self
            )
          }
        }

        if (primaryKey && self.definition.store.supportsReturning) {
          query.returning(primaryKey)
        }

        return query
          .insert(values)
          .catch(function(error) {
            debug(query.toString())
            throw new Store.SQLError(error)
          })
          .then(function(result) {
            debug(query.toString())

            var idTmp = {}
            idTmp[primaryKey] = result[0]

            self._exists({ relations: false, changes: false })
            self.set(idTmp, 'read')

            return self.callInterceptors('afterCreate', [self, options])
          })
      }
    )
  }
}

exports.model = {
  /**
   * Updates all records which match the conditions. beforeSave, afterSave, beforeUpdate and afterUpdate want be called!
   * @class Model
   * @method updateAll
   * @alias update
   * @return {Promise}
   */
  update: function(attributes, options) {
    return this.updateAll(attributes, options)
  },
  updateAll: function(attributes, options) {
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

    var attrs = {}
    Object.keys(attributes).forEach(function(attribute) {
      var field = self.store.toInternalAttributeName(attribute)
      attrs[field] = attributes[attribute]
    })

    return self
      .callInterceptors('beforeFind', [findQuery])
      .then(function() {
        if(withSubquery){
          query.whereIn(self.definition.primaryKeys[0], findQuery.select(self.definition.primaryKeys))
        }
        return query.update(attrs)
      })
      .catch(function(error) {
        debug(query.toString())
        throw new Store.SQLError(error)
      })
      .then(function(response) {
        debug(query.toString())
      })
  }
}

/*
 * CHAIN
 */
exports.chain = {
  // create multiple records at once
  save: function save(options) {
    const self = this
    options = options || {}

    if (self.options.polymorph) return this.callParent(options)

    return Promise.all(
      this.map(function(record) {
        // validate all records at once.
        return record.validate()
      })
    )
      .then(function() {
        // if validation succeeded, start the transaction
        return self.store.startTransaction(options, function() {
          return self
            ._runLazyOperation(options)
            .then(function() {
              // inside the transaction create all new records and afterwards save all the others
              return self._create(options)
            })
            .then(function() {
              // will save all existing records with changes...
              return self.callParent(options, save)
            })
        })
      })
      .then(function() {
        return self
      })
  },

  _create: function() {
    return Promise.resolve() // mysql and sqlite do not support multi INSERT with returning. Postgres will overwrite this method
  }
}
