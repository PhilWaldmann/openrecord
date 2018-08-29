const inflection = require('inflection')

exports.definition = {
  hasMany: function(name, options) {
    const definition = this
    const utils = definition.store.utils
    const primaryKeys = definition.primaryKeys || []
    options = options || {}
    options.type = 'has_many'

    options.preInitialize =
      options.preInitialize ||
      function() {
        this.callParent() // converts model name to the model object

        options.from = options.from || primaryKeys
        options.to =
          options.to ||
          primaryKeys.map(function(key) {
            return (
              inflection.singularize(definition.getName().toLowerCase()) +
              '_' +
              key
            )
          })

        // polymorphic relation "from the other side"...
        if (options.as) {
          const relation = options.model.definition.relations[options.as]

          relation.init()

          // reverse polymorphic relation
          if (relation.type === 'belongs_to_polymorphic') {
            // add static conditions: type = model name
            options.conditions = {}
            options.conditions[relation.typeField] = definition.modelName

            options.to = relation.idField
          }
        }
      }

    options.initialize =
      options.initialize ||
      function() {
        this.callParent()
        if (!options.model) return

        // magic setter <relation_name>_ids = [1, 2, 3] and getter
        const targetPrimaryKeys = options.model.definition.primaryKeys || []
        if (targetPrimaryKeys.length === 1) {
          const key = targetPrimaryKeys[0]

          definition.attribute(
            definition.store.toExternalAttributeName(inflection.singularize(name) + '_' + inflection.pluralize(key)),
            Array,
            {
              hidden: true,
              setter: function(values) {
                this[name] = values // the same as `record.relation = [1, 2]`. But with a nicer syntax: `record.relation_ids = [1, 2]`
              },

              getter: function() {
                const records = this['_' + name]
                if (!records) return []
                return records.map(function(record) {
                  return record[key]
                })
              }
            }
          )
        }
      }

    options.setter =
      options.setter ||
      function(records) {
        if (records === this.relations[name]) return

        var chain = this.relations[name]

        // if no relational data exists (e.g. Parent.new())
        // create a new collection
        if (!chain) {
          if (!options.model)
            throw new Error('You need to implement your own `setter` function')
          chain = options.model.chain()
          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', this) // + the parent record
          options.setResult(this, chain)
        }

        if (chain._isResolved()) {
          // remove unused child records (triggered on save by the parent record!)
          const targetPrimaryKeys = options.model.definition.primaryKeys || []
          const recordsToRemove = utils.distinctRecords(
            chain,
            records,
            targetPrimaryKeys
          )
          chain.setInternal('__clear_only', recordsToRemove)
        }

        chain.clear()
        chain.add(records)
        chain._resolved()
      }

    // add a single record
    options.add =
      options.add ||
      function(parent, record) {
        record.set(options.conditions) // add relation conditions to record. Will only work in `equality` conditions. e.g. {type: 'Foo'}
        options.to.forEach(function(key, index) {
          const opposite = options.from[index]
          const currentValue = record[key]
          if (Array.isArray(currentValue)) {
            if (currentValue.indexOf(parent[opposite]) === -1)
              currentValue.push(parent[opposite])
          } else {
            record[key] = parent[opposite]
          }
        })

        options.setResult(parent, record.__chainedModel)
      }

    options.afterSave =
      options.afterSave ||
      function(parent, saveOptions) {
        const collection = parent.relations[name]
        if (collection && options.autoSave) {
          collection.forEach(function(record) {
            // set new id on children
            options.add(parent, record)
          })

          return collection.save(saveOptions)
        }
      }

    options.afterDestroy =
      options.afterDestroy ||
      function(parent, destroyOptions) {
        const conditions = utils.recordsToConditions(
          [parent],
          options.from,
          options.to
        )
        if (!conditions) return

        const query = options.model.where(conditions)
        if (options.conditions) query.where(options.conditions) // conditions on the relation
        if (options.scope) query[options.scope]() // scope on the relation

        if (options.dependent === 'delete') {
          return query.deleteAll(destroyOptions)
        }
        if (options.dependent === 'destroy') {
          return query.destroyAll(destroyOptions)
        }
        if (options.dependent === 'nullify') {
          const update = {}
          options.to.forEach(function(key) {
            update[key] = null
          })
          return query.updateAll(update, destroyOptions)
        }
      }

    // remove a single record
    options.remove =
      options.remove ||
      function(parent, record) {
        this._lazyOperation(function(transOptions) {
          if (options.dependent === 'delete') {
            return record.delete(transOptions)
          }
          if (options.dependent === 'destroy') {
            return record.destroy(transOptions)
          }
          // nullify!
          options.to.forEach(function(key) {
            record[key] = null
          })
          return record.save(transOptions)
        })
      }

    // clear all records
    options.clear =
      options.clear ||
      function(parent, collection) {
        if (!options.model)
          throw new Error('You need to implement your own `setter` function')
        const targetPrimaryKeys = options.model.definition.primaryKeys || []
        const records = collection.getInternal('__clear_only') || collection
        var conditions = utils.recordsToConditions(
          records,
          targetPrimaryKeys,
          targetPrimaryKeys
        )

        if (!conditions && collection._isResolved()) return
        if (!conditions)
          conditions = utils.recordsToConditions(
            [parent],
            options.from,
            options.to
          )
        if (!conditions) return

        collection.clearInternal('__clear_only')

        collection._lazyOperation(function(transOptions) {
          if (options.dependent === 'delete') {
            return options.model.where(conditions).deleteAll(transOptions)
          }
          if (options.dependent === 'destroy') {
            return options.model.where(conditions).destroyAll(transOptions)
          }
          // nullify!
          const update = {}
          options.to.forEach(function(key) {
            update[key] = null
          })
          return options.model.where(conditions).updateAll(update, transOptions)
        })

        // remove record from collection
        records.forEach(function(record) {
          const index = collection.indexOf(record)
          collection.splice(index, 1)
        })
      }

    return this.relation(name, options)
  }
}
