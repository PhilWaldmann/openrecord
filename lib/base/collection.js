/*
 * MODEL
 */
exports.model = {
  /**
   * Initialize a new Record.
   * You could either use
   * ```js
   * var records = new Model();
   * ```
   * @or
   * ```js
   * var records = Model.new();
   * ```
   *
   * @class Model
   * @method new
   * @param {object} attributes - Optional: The records attributes
   *
   * @return {Record}
   */
  new: function(data, castType) {
    data = data || {}

    // if it's already a record
    if (data.definition && data._exists) {
      if (this.add) this.add(data)
      return data
    }

    if (this.chained) {
      var record = this.model.new()
      if (this.definition.temporary) {
        record.definition = this.definition
      }

      record.__chainedModel = this
      record.set(data, castType)

      this.add(record)

      return record
    }

    return new this(data, castType)
  },

  /**
   * Creates a new record and saves it
   * @class Model
   * @method create
   * @param {object} data - The data of the new record
   */
  create: function(data, options) {
    var self = this

    if (Array.isArray(data)) {
      return this.chain()
        .add(data)
        .save()
    }
    return this.runScopes().then(function() {
      return self.new(data).save(options)
    })
  },

  /**
   * `exec()` will return raw JSON instead of records
   * @class Model
   * @method asJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   *
   * @return {Model}
   * @see Model.exec()
   */
  asJson: function(allowedAttributes) {
    var self = this.chain()

    self.setInternal('as_json', true)

    if (Array.isArray(allowedAttributes))
      self.setInternal('allowed_attributes', allowedAttributes)

    return self
  },

  /**
   * `exec()` will return the raw store output
   * Be aware, that no `afterFind` hook will be fired if you use `asRaw()`.
   *
   * @class Model
   * @method asRaw
   *
   * @return {Model}
   * @see Model.exec()
   */
  asRaw: function() {
    // if the collection is already resolved, return a unresolved and empty copy!
    const self = this._unresolve().asJson()

    self.setInternal('as_raw', true)

    return self
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.afterFind(function(data) {
      // var asJson = this.getInternal('as_json')
      var records = data.result
      var i

      this._resolved()

      if (!records) return
      if (this.getInternal('as_raw')) return
      // if(asJson !== true){
      // CREATE RECORDs WITH DATA
      for (i = 0; i < records.length; i++) {
        records[i] = this.new(records[i], 'read')
        records[i]._exists()
      }

      data.result = this
      // }else{
      //   // RETURN RAW JSON
      //   if(!asRaw){
      //     var allowedAttributes = this.getInternal('allowed_attributes')
      //     var dummyRecord = this.new() // will covert values to the right format

      //     for(i = 0; i < records.length; i++){
      //       dummyRecord.relations = {}
      //       dummyRecord.attributes = {}
      //       dummyRecord.set(records[i], 'read')
      //       records[i] = dummyRecord.toJson(allowedAttributes)
      //     }
      //   }
      // }
    }, 55)
  }
}

/*
 * CHAIN
 */
exports.chain = {
  /**
   * Adds new Records to the collection
   *
   * @class Collection
   * @method add
   * @param {array} Record - Either an object which will be transformed into a new Record, or an existing Record
   *
   * @return {Collection}
   */
  add: function(records) {
    var self = this.chain()
    var relation = self.getInternal('relation')
    var parentRecord = self.getInternal('relation_to')

    if (!records) return self
    if (!Array.isArray(records)) records = [records]

    // build a map to check if existing records were added - via primary key
    const primaryKeys = self.definition.primaryKeys
    const map = {}
    self.forEach(function(record) {
      var mapKey = []
      primaryKeys.forEach(function(key) {
        if (record[key]) mapKey.push(record[key])
      })
      if (mapKey.length > 0) map[mapKey.join('|')] = record
    })

    records.forEach(function(record) {
      var fromKeys = false
      var mapKey = []

      if (record) {
        // check if `records` is a primitive, or an array of primitives with the same amount of elements as our primary keys
        if (
          typeof record !== 'object' ||
          (Array.isArray(record) &&
            record.length === primaryKeys.length &&
            typeof record[0] !== 'object')
        ) {
          // not a record/object... so it must be a primary key!
          if (self.options.polymorph)
            throw new Error('Polymorphic relations need to add a record!')

          var keys = record
          const tmpRecord = {}

          if (!Array.isArray(keys)) keys = [keys]

          primaryKeys.forEach(function(key, index) {
            if (keys[index]) {
              tmpRecord[key] = keys[index]
              mapKey.push(keys[index])
            }
          })

          if (mapKey.length > 0 && map[mapKey.join('|')]) {
            // found a record no update needed, because we only got the id...
            return
          }

          record = tmpRecord
          fromKeys = true
        }

        primaryKeys.forEach(function(key) {
          if (record[key]) mapKey.push(record[key])
        })

        if (mapKey.length > 0 && map[mapKey.join('|')]) {
          // found a record for update!
          map[mapKey.join('|')].set(record)
          return
        }

        const originalInput = record
        // convert object to a record
        if (self.options.polymorph) {
          if (record.model && !(record instanceof record.model))
            throw new Error(
              'Record/Model instance expected in polymorphic relation!'
            )
        } else {
          if (!(record instanceof self.model)) record = self.model.new(record)
        }

        record.__chainedModel = self

        if (fromKeys) {
          record._exists()
        } else {
          if (mapKey.length > 0 && mapKey.length === primaryKeys.length) {
            record._exists()
            if (!(originalInput instanceof self.model)) {
              // set changes. if for example the record is not loaded, but we now have the primary keys. Only the given fields are changes.
              // all fields that are not present in the original input, must not be changed, because we dont now their value.
              Object.keys(originalInput).forEach(function(key) {
                // ignore primary keys
                if (primaryKeys.indexOf(key) === -1) {
                  record.changes[key] = [undefined, originalInput[key]]
                }
              })
            }
          }
        }

        // a new one
        self.push(record)

        if (relation && parentRecord) {
          if (record && typeof relation.add === 'function') {
            relation.add.call(self, parentRecord, record)
          }
        }
      }
    })

    return self
  },

  /**
   * Removes a Record from the Collection
   *
   * @class Collection
   * @method remove
   * @param {integer} index - Removes the Record on the given index
   * @or
   * @param {Record} record - Removes given Record from the Collection
   *
   * @return {Collection}
   */
  remove: function(index) {
    var self = this.chain()

    if (typeof index !== 'number') {
      index = self.indexOf(index)
    }

    const record = self[index]
    var relation = self.getInternal('relation')
    var parentRecord = self.getInternal('relation_to')

    if (
      record &&
      relation &&
      parentRecord &&
      typeof relation.remove === 'function'
    ) {
      relation.remove.call(self, parentRecord, record)
    }

    self.splice(index, 1)

    return self
  },

  clear: function() {
    var self = this.chain()
    var relation = self.getInternal('relation')
    var parentRecord = self.getInternal('relation_to')

    if (relation && parentRecord && typeof relation.clear === 'function') {
      relation.clear(parentRecord, self)
    } else {
      self.splice(0, self.length)
    }

    return self
  },

  _lazyOperation: function(operation) {
    this.addInternal('lazy_operations', operation)
  },

  _runLazyOperation: function(options) {
    const ops = this.getInternal('lazy_operations')
    if (!ops) return Promise.resolve()

    this.clearInternal('lazy_operations')

    return this.store.utils.parallel(
      ops.map(function(fn) {
        return fn(options)
      })
    )
  },

  _exists: function() {
    this._resolved()
    for (var i = 0; i < this.length; i++) {
      this[i]._exists()
    }
  },

  _resolved: function() {
    this.setInternal('resolved', true)
  },

  _isResolved: function() {
    return this.getInternal('resolved')
  },

  _unresolve: function() {
    if (!this._isResolved()) return this

    const self = this.chain({ clone: true })

    self.setInternal('relation', this.getInternal('relation'))
    self.setInternal('relation_to', this.getInternal('relation_to'))
    self.setInternal('resolved', false)
    self.setInternal('no_relation_cache', true)
    self.splice(0)
    self.__resolving = null

    return self
  },

  /**
   * Creates a temporary definition object, that lives only in the current collection.
   * This is usefull if you need special converters that's only active in a certain scope.
   *
   * @class Collection
   * @method temporaryDefinition
   * @param {function} fn - Optional function with the definition scope
   *
   * @return {Definition}
   */
  __temporary_definition_attributes: [
    'attributes',
    'interceptors',
    'relations',
    'validations'
  ],

  temporaryDefinition: function(fn) {
    var tmp = { temporary: true }

    if (this.definition.temporary) {
      return this.definition
    }

    for (var name in this.definition) {
      var prop = this.definition[name]

      if (this.__temporary_definition_attributes.indexOf(name) !== -1) {
        tmp[name] = this.definition.store.utils.clone(prop)
        continue
      }

      tmp[name] = prop
    }

    Object.defineProperty(this, 'definition', {
      enumerable: false,
      value: tmp
    })

    if (typeof fn === 'function') {
      fn.call(this.definition)
    }

    return this.definition
  }
}

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config) {
    var chainedModel = config ? config.__chainedModel : null
    var self = this

    if (this.model.chained) {
      chainedModel = this
    }

    Object.defineProperty(this, '__chainedModel', {
      enumerable: false,
      writable: true,
      value: chainedModel
    })
    Object.defineProperty(this, '__exists', {
      enumerable: false,
      writable: true,
      value: false
    })

    this.__defineGetter__('isNewRecord', function() {
      return !self.__exists
    })
  },

  _exists: function(options) {
    options = options || {}
    if (this.__exists) return
    this.__exists = true

    if (options.changes !== false) {
      this.changes = {} // Hard-Reset all changes
    }

    if (options.relations === false) return

    for (var name in this.definition.relations) {
      if (this.definition.relations.hasOwnProperty(name)) {
        if (
          this.relations &&
          this.relations[name] &&
          typeof this.relations[name] === 'function'
        ) {
          this.relations[name]._exists()
        }
      }
    }
  }
}
