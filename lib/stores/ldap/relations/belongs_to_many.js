exports.definition = {
  belongsToMany: function(name, options) {
    options = options || {}

    options.bulkFetch = false
    options.to = 'dn'

    const definition = this
    const utils = definition.store.utils

    options.loadFromConditions = function() {} // remove default behaviour of `hasMany` relation
    options.preInitialize = function() {
      if (options.model) this.callParent()
    }

    options.collection = function(parentRecord) {
      const chain = parentRecord.definition.model.chain({ polymorph: true })

      chain.setInternal('relation', options) // add the parent relation of this collection
      chain.setInternal('relation_to', parentRecord) // + the parent record

      return chain
    }

    options.loadFromRecord =
      options.loadFromRecord ||
      function(parentRecord, include) {
        const jobs = []
        const dn = parentRecord[options.from[0]]

        if (Array.isArray(dn)) {
          dn.forEach(function(dn) {
            jobs.push(getRecordByDN(dn, include))
          })
        } else {
          jobs.push(getRecordByDN(dn, include))
        }

        return definition.store.utils.parallel(jobs).then(function(results) {
          // flatten
          results = [].concat.apply([], results)

          // add the result to corresponding record
          parentRecord.relations[name] = options.filterCache(
            parentRecord,
            results
          )

          return results
        })
      }

    function getRecordByDN(dn, include) {
      if (!dn) return
      const model = options.model || definition.model
      const chain = model.find(dn)

      if (options.conditions) chain.where(options.conditions) // conditions on the relation
      if (options.scope) chain[options.scope].apply(chain, include.args) // scope on the relation
      if (include.conditions) chain.where(include.conditions) // nested conditions via `where({relation_name: {...conditions...}})`
      if (include.children) chain.include(include.children) // nested includes via `include({relation_name: {nested_relation_name: { ... }}})`
      if (include.scope) chain[include.scope].apply(chain, include.args) // scope defined via `include({relation_name: {$scope: 'myscope'}})`

      chain.setInternal('without_object_class', true) // don't add objectClass=ou - so we get all objects
      chain.select(definition.store.getAllAvailableAttributes()) // we need to add all needed attribute to that request to make sure every record has everything loaded
      if (!options.model) chain.asRaw()

      return chain
    }

    options.beforeSave = function(parent, saveOptions) {
      const collection = parent.relations[name]
      if (collection) {
        return collection.save(saveOptions)
      }
    }

    options.afterSave = function(parent, saveOptions) {}

    options.setter =
      options.setter ||
      function(records) {
        if (records === this.relations[name]) return

        var chain = this.relations[name]

        // if no relational data exists (e.g. Parent.new())
        // create a new collection
        if (!chain) {
          chain = definition.model.chain({ polymorph: true })
          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', this) // + the parent record
          chain._resolved()
        }

        // lazy remove unused child records (on save of the parent record!)
        const recordsToRemove = utils.distinctRecords(chain, records, ['dn'])

        chain.setInternal('__clear_only', recordsToRemove)
        chain.clear()
        chain.add(records)
      }

    options.add =
      options.add ||
      function(parent, record) {
        record.set(options.conditions) // add relation conditions to record. Will only work in `equality` conditions. e.g. {type: 'Foo'}
        options.to.forEach(function(key, index) {
          const opposite = options.from[index]
          const ids = parent[opposite] || []
          ids.push(record[key])
          parent[opposite] = utils.uniq(ids)
        })

        options.setResult(parent, record.__chainedModel)
      }

    options.clear = function(parent, collection) {
      const records = collection.getInternal('__clear_only') || collection
      if (!records || records.length === 0) return

      collection.clearInternal('__clear_only')

      parent.relations[name]._lazyOperation(function(transOptions) {
        if (options.dependent === 'destroy') {
          const jobs = []
          records.forEach(function(record) {
            jobs.push(function() {
              return record.destroy(transOptions)
            })
          })
          return utils.parallel(jobs)
        }
      })

      // remove record from collection
      records.forEach(function(record) {
        const index = collection.indexOf(record)
        collection.splice(index, 1)
      })
    }

    options.filterCache =
      options.filterCache ||
      function(parentRecord, records) {
        const chain = parentRecord.definition.model.chain({ polymorph: true })

        if (records) {
          if (!Array.isArray(records)) records = [records]
          const relatedRecords = records
            .filter(function(record) {
              if (!record) return
              if (!record.dn) return

              record.dn = definition.store.utils.normalizeDn(record.dn)
              return definition.store.utils.checkFieldEquality(
                parentRecord[options.from[0]],
                record.dn
              )
            })
            .map(function(record) {
              // convert to model record
              const RecordModel = definition.store.getByObjectClass(
                record.objectClass
              )
              if (!RecordModel)
                throw new Error(
                  'No Model for objectClass: ' + record.objectClass
                )
              return RecordModel.new(record, 'read')
            })

          chain.add(relatedRecords) // add all child records
          chain._exists() // set this collection as existing (all records fetched from the datastore!)
        }

        return chain
      }

    return this.callParent(name, options)
  }
}
