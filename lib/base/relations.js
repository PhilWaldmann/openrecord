/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    var self = this
    this.relations = {}
    this._relations_initialized = false

    function relationHandler(type) {
      return function(record, options) {
        const jobs = []

        Object.keys(self.relations).forEach(function(relationName) {
          const relation = self.relations[relationName]
          if (typeof relation[type] === 'function') {
            const job = relation[type](record, options)
            if (job) jobs.push(job)
          }
        })

        if (jobs.length === 0) return

        return self.store.utils.parallel(jobs)
      }
    }

    this.beforeSave(relationHandler('beforeSave'), 100)
    this.afterSave(relationHandler('afterSave'), 100)
    this.afterDestroy(relationHandler('afterDestroy'), 100)
  },

  _initRelations: function() {
    if (this._relations_initialized) return

    Object.keys(this.relations).forEach(function(relationName) {
      this.relations[relationName].init()
    }, this)
  },

  relation: function(name, options) {
    const Store = require('../store')
    const self = this
    var ready = false

    options = options || {}
    options.name = name

    if (!name) throw new Error('no name given!')
    if (!options.type) throw new Error('no type given!')
    if (options.primary_key) throw new Error('`primary_key` is now `from`')
    if (options.foreign_key) throw new Error('`foreign_key` is now `to`')

    self.relations[name] = options

    if (options.bulkFetch !== false) options.bulkFetch = true
    if (!options.autoSave) options.autoSave = self.store.config.autoSave

    if (options.bulkFetch) options = this._bulkFetch(name, options)
    if (options.through) options = this._hasManyThrough(name, options)

    // The getter returns the relation - or more precise a Promise which could be a Collection
    // if no data was loaded, it will request all data for all sibling records (for this relation ony)
    // which solves the n+1 problem
    // But promise will only return records related to the record!
    self.getter(
      name,
      options.getter ||
        function() {
          // this.relations is the relations object of the record!
          var result = this['_' + name]

          if (result !== undefined) {
            if (result && result.then) return result
            return Promise.resolve(result)
          }

          // if we don't have any data yet, return an empty collection
          return options.collection(this)
        },
      true
    )

    // the promise free getter!
    self.getter(
      '_' + name,
      options.rawGetter ||
        function() {
          options.init() // just in case our target model is not ready yet!
          const result = this.relations[name]
          if (typeof options.transform === 'function') {
            return options.transform(result)
          }
          return result
        }
    )

    if (options.setter)
      self.setter(name, function(value) {
        options.init()
        options.setter.call(this, value)
      })

    options.init = function() {
      if (ready) return

      options.preInitialize.call(self)
      options.initialize.call(self)
      ready = true
    }

    options.loadWithCollection =
      options.loadWithCollection ||
      function(collection) {
        const parentRecord = collection.getInternal('relation_to')
        const noCache = collection.getInternal('no_relation_cache')

        if (!parentRecord) return

        // do we use a cache?
        if (!noCache) {
          // does the relation support bulk loading
          if (typeof options.getFromCache === 'function') {
            // return from the cache!
            return options
              .getFromCache(parentRecord, null, collection) // creates a new collection...
              .then(function(collection) {
                options.setResult(parentRecord, collection)
                return parentRecord['_' + name] // none promise getter
              })
          }

          // if we want to cache it...
          // set the result of the upcomming data fetch to the parent record
          options.setResult(parentRecord, collection)
        }

        // otherwise just add relational conditions to the collection
        const conditions = self.store.utils.recordsToConditions(
          [parentRecord],
          options.from,
          options.to
        )

        collection.where(conditions)
        if (options.conditions) collection.where(options.conditions) // conditions on the relation
        if (options.scope) collection[options.scope]() // scope on the relation
      }

    options.loadFromRecord =
      options.loadFromRecord ||
      function(parentRecord, include) {
        if (options.model) {
          const conditions = self.store.utils.recordsToConditions(
            [parentRecord],
            options.from,
            options.to
          )
          if (!conditions) return Promise.resolve([]) // not enough info to form conditions. Better return an empty result instead of loading the whole dataset!

          const query = options.model.where(conditions)
          if (options.conditions) query.where(options.conditions) // conditions on the relation
          if (options.scope) query[options.scope].apply(query, include.args) // scope on the relation
          if (include.conditions) query.where(include.conditions) // nested conditions via `where({relation_name: {...conditions...}})`
          if (include.children) query.include(include.children) // nested includes via `include({relation_name: {nested_relation_name: { ... }}})`
          if (include.scope) query[include.scope].apply(query, include.args) // scope defined via `include({relation_name: {$scope: 'myscope'}})`

          return query.then(function(result) {
            parentRecord.relations[name] = query // result could be a single record, so we assign the query => collection
            return result
          })
        }

        throw new Error(
          'You need to implement your own `loadFromRecord` function! (relation: ' +
            name +
            ')'
        )
      }

    options.setResult = function(parentRecord, collection) {
      parentRecord.relations[name] = collection
    }

    // called only once -> before first use
    options.preInitialize =
      options.preInitialize ||
      function() {
        return this.callParent()
      }
    options.preInitialize._parent = function() {
      var store = self.store
      if (options.store) store = Store.getStoreByName(options.store)
      if (!store)
        throw new Error(
          "Unknown store '" + options.store + "' on relation '" + name + "'"
        )

      const model = store.Model(options.model || name)
      if (!model)
        throw new Error(
          "Unknown model '" + options.model + "' on relation '" + name + "'"
        )
      options.model = model
    }

    // called only once -> after preInitialize
    options.initialize =
      options.initialize ||
      function() {
        return this.callParent()
      }
    options.initialize._parent = function() {
      if (!Array.isArray(options.from)) options.from = [options.from]
      if (!Array.isArray(options.to)) options.to = [options.to]

      if (options.from.length !== options.to.length) {
        throw new Error(
          "Can't connect " +
            self.getName() +
            '(' +
            options.from.join(', ') +
            ') with ' +
            options.model.definition.getName() +
            '(' +
            options.to.join(', ') +
            ')'
        )
      }
    }

    options.collection =
      options.collection ||
      function(parentRecord) {
        if (options.model) {
          const chain = options.model.chain()

          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', parentRecord) // + the parent record

          const conditions = self.store.utils.recordsToConditions(
            [parentRecord],
            options.from,
            options.to
          )

          if (conditions) chain.where(conditions)
          if (options.conditions) chain.where(options.conditions) // conditions on the relation
          if (options.scope) chain[options.scope]() // scope on the relation

          return chain
        }

        throw new Error(
          'You need to implement your own `collection` function! (relation: ' +
            name +
            ')'
        )
      }

    return this
  }
}

exports.chain = {
  mixinCallback: function() {
    this.definition._initRelations()
  }
}

/*
 * RECORD
 */
exports.record = {
  // clear all loadede relations
  clearRelations: function() {
    var self = this

    Object.keys(this.definition.relations).forEach(function(key) {
      delete self.relations[key]
    })

    return this
  },

  // set relational data via it's parent
  // + check if the given record(s) have a primary key set => update instead of create!
  set: function(field, value) {
    var tmp = this.callParent(field, value)

    if (typeof field === 'object') {
      this.relations = this.relations || {}

      Object.keys(this.definition.relations).forEach(function(relationName) {
        if (field[relationName] !== undefined)
          this[relationName] = field[relationName]
      }, this)
    }

    return tmp
  }
}
