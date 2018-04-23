exports.definition = {
  belongsToPolymorphic: function(name, options) {
    const Store = require('../../store')
    const self = this
    const utils = this.store.utils

    options = options || {}
    options.type = 'belongs_to_polymorphic'

    options.preInitialize = function() {
      options.storeField = options.storeField || name + '_store'
      options.typeField = options.typeField || name + '_type'
      options.idField = options.idField || name + '_id'

      options.from = [] // set to empty array to avoid any conflicts
      options.to = []
    }

    options.setter =
      options.setter ||
      function(record) {
        if (this.relations[name] && record === this.relations[name][0]) return

        var chain = this.relations[name]

        // if no relational data exists (e.g. Parent.new())
        // create a new collection
        if (!chain) {
          chain = this.model.chain({ polymorph: true })
          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', this) // + the parent record
          options.setResult(this, chain)
        }

        if (Array.isArray(record)) record = record[0]
        if (record === null) {
          this[options.typeField] = null
          this[options.idField] = null
        } else {
          chain.remove(0)
          chain.add(record)
        }
        chain._resolved()
      }

    // add a single record
    options.add = function(parent, record) {
      record.set(options.conditions) // add relation conditions to record. Will only work in `equality` conditions. e.g. {type: 'Foo'}

      parent[options.typeField] = record.model.modelName
      parent[options.idField] = record[record.definition.primaryKeys[0]]

      options.setResult(parent, record.__chainedModel)
    }

    options.beforeSave =
      options.beforeSave ||
      function(parent, saveOptions) {
        const collection = parent.relations[name]
        if (collection) {
          return collection.save(saveOptions).then(function() {
            collection.forEach(function(record) {
              // set new ids on parent
              options.add(parent, record)
            })
          })
        }
      }

    options.afterDestroy =
      options.afterDestroy ||
      function(parent, transOptions) {
        const Model = self.store.Model(parent[options.typeField])
        if (!Model) return

        const conditions = utils.recordsToConditions(
          [parent],
          [options.idField],
          [Model.definition.primaryKeys[0]]
        )
        if (!conditions) return

        var dependent = options.dependent
        if (typeof dependent === 'object')
          dependent = dependent[parent[options.typeField]] // Allow for `dependent: {'ModelA': 'delete', 'ModelB': 'nullify'}`

        const query = Model.where(conditions)
        if (options.conditions) query.where(options.conditions) // conditions on the relation
        if (options.scope) query[options.scope]() // scope on the relation

        if (dependent === 'delete') {
          return query.deleteAll(transOptions)
        }
        if (dependent === 'destroy') {
          return query.destroyAll(transOptions)
        }
        // ignore `nullify` on belongs to relation -> got deleted anyways
      }

    // remove a single record
    options.remove = function(parent, record) {
      this._lazyOperation(function(transOptions) {
        var dependent = options.dependent
        if (typeof dependent === 'object')
          dependent = dependent[parent[options.typeField]] // Allow for `dependent: {'ModelA': 'delete', 'ModelB': 'nullify'}`

        if (dependent === 'delete') {
          return record.delete(transOptions)
        }
        if (dependent === 'destroy') {
          return record.destroy(transOptions)
        }
        // nullify!
        options.from.forEach(function(key) {
          parent[key] = null
        })
        // to need to return parent.save()
        // because lazy operations will be triggered only by parent.save()
        // so it would be a double save...
      })
    }

    options.loadFromRecords = function(parentCollection, include) {
      const relationCache = parentCollection.getInternal('relation_cache') || {}
      const targetMap = {}
      const jobs = []

      // return cached result, if available!
      if (relationCache[options.name]) {
        const result = relationCache[options.name]
        if (!result.then) return Promise.resolve(relationCache[options.name])
        return result
      }

      parentCollection.forEach(function(record) {
        const targetStore = record[options.storeField] || ''
        const targetModel = record[options.typeField]
        const targetId = record[options.idField]
        const key = targetStore + '|' + targetModel

        if (!targetModel || !targetId) return

        targetMap[key] = targetMap[key] || []
        targetMap[key].push(targetId)
      })

      Object.keys(targetMap).forEach(function(key) {
        const keyParts = key.split('|')

        var store = self.store
        if (keyParts[0]) store = Store.getStoreByName(keyParts[0])
        if (!store)
          throw new Error(
            "Unknown store '" +
              keyParts[0] +
              "' on polymorphic relation '" +
              name +
              "'"
          )

        const model = store.Model(keyParts[1])
        if (!model)
          throw new Error(
            "Unknown model '" +
              keyParts[1] +
              "' on polymorphic relation '" +
              name +
              "'"
          )

        const primaryKeys = model.definition.primaryKeys
        if (primaryKeys.length > 1)
          throw new Error(
            "Can't load " +
              model.definition.modelName +
              ' as a polymorhic relation. Only one primary key is allowed!'
          )
        if (primaryKeys.length === 0)
          throw new Error(
            "Can't load " +
              model.definition.modelName +
              ' as a polymorhic relation. A primary key is required!'
          )

        const conditions = {}
        conditions[primaryKeys[0]] = targetMap[key]

        const chain = model.where(conditions)

        if (include.children) {
          utils.toIncludesList(include.children).forEach(function(inc) {
            // include only if the polymorphic model has a relation with the same name
            // otherwise ignore it!
            if (chain.definition.relations[inc.relation]) {
              chain.addInternal('includes', inc)
            }
          })
        }

        jobs.push(chain)
      })

      return utils.parallel(jobs).then(function(result) {
        // save result in parent collection
        relationCache[options.name] = result
        parentCollection.setInternal('relation_cache', relationCache)

        // add the result to corresponding record
        parentCollection.forEach(function(record) {
          record.relations[name] = options.filterCache(record, result)
        })

        return result
      })
    }

    options.filterCache = function(parentRecord, records) {
      var chain = []
      if (!records) return null

      records.forEach(function(collection) {
        if (
          collection.definition.modelName === parentRecord[options.typeField]
        ) {
          // now we need to filter the collection by `options.idField` only

          chain = collection.model.chain()
          const relatedRecords = collection.filter(function(record) {
            const primaryKey = collection.definition.primaryKeys[0]
            return record[primaryKey] === parentRecord[options.idField]
          })

          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', parentRecord) // + the parent record
          chain.add(relatedRecords) // add all child records
          chain._exists() // set this collection as existing (all records fetched from the datastore!)
        }
      })

      return chain[0]
    }

    options.collection = function(parentRecord) {
      const chain = parentRecord.definition.model.chain({ polymorph: true })

      chain.setInternal('relation', options) // add the parent relation of this collection
      chain.setInternal('relation_to', parentRecord) // + the parent record

      return chain
    }

    return this.relation(name, options)
  }
}
