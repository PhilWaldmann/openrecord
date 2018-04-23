const inflection = require('inflection')

exports.definition = {
  belongsToMany: function(name, options) {
    const definition = this
    const utils = definition.store.utils
    options = options || {}
    options.type = 'belongs_to_many'

    options.preInitialize =
      options.preInitialize ||
      function() {
        this.callParent() // converts model name to the model object

        const targetPrimaryKeys = options.model.definition.primaryKeys || []

        options.from =
          options.from ||
          targetPrimaryKeys.map(function(key) {
            var fromKey =
              inflection.singularize(
                options.model.definition.getName().toLowerCase()
              ) +
              '_' +
              key +
              's'
            if (!definition.attributes[fromKey])
              fromKey = name + '_' + key + 's'
            return fromKey
          })
        options.to = options.to || targetPrimaryKeys
      }

    options.initialize =
      options.initialize ||
      function() {
        this.callParent()

        // add change notifications to the `from` keys
        options.from.forEach(function(attributeName) {
          if (!definition.attributes[attributeName]) return
          definition.attributes[attributeName].notifications.push(function(
            values
          ) {
            if (!values) this.relations[name] = undefined
            if (!this.relations[name]) return
            if (!Array.isArray(values)) values = [values]
            this[name] = values
          })
        })
      }

    options.setter =
      options.setter ||
      function(records) {
        if (records === this.relations[name]) return

        var chain = this.relations[name]

        // if no relational data exists (e.g. Parent.new())
        // create a new collection
        if (!chain) {
          chain = options.model.chain()
          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', this) // + the parent record
          chain._resolved()
        }

        // lazy remove unused child records (on save of the parent record!)
        const targetPrimaryKeys = options.model.definition.primaryKeys || []
        const recordsToRemove = utils.distinctRecords(
          chain,
          records,
          targetPrimaryKeys
        )

        chain.setInternal('__clear_only', recordsToRemove)
        chain.clear()
        chain.add(records)
      }

    // load from conditions with belongs to many is not possible!
    options.loadFromConditions = options.loadFromConditions || function() {}

    // add a single record
    options.add =
      options.add ||
      function(parent, record) {
        record.set(options.conditions) // add relation conditions to record. Will only work in `equality` conditions. e.g. {type: 'Foo'}
        options.to.forEach(function(key, index) {
          const opposite = options.from[index]
          const ids = parent[opposite] || []
          if (ids.indexOf(record[key]) === -1) ids.push(record[key])
          parent[opposite] = ids
        })

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
          return query.deleteAll(transOptions)
        }
        if (options.dependent === 'destroy') {
          return query.destroyAll(transOptions)
        }
        // ignore `nullify` on belongs to many relation -> got deleted anyways
      }

    // just remove the ids from the parent attribute
    options.remove =
      options.remove ||
      function(parent, record) {
        options.from.forEach(function(key, index) {
          if (!Array.isArray(parent[key])) return

          const opposite = options.to[index]
          parent[key] = parent[key].filter(function(value) {
            return !utils.checkFieldEquality(record[opposite], value)
          })
        })
      }

    // clear all records
    options.clear =
      options.clear ||
      function(parent, collection) {
        const targetPrimaryKeys = options.model.definition.primaryKeys
        const records = collection.getInternal('__clear_only') || collection
        const conditions = utils.recordsToConditions(
          records,
          targetPrimaryKeys,
          targetPrimaryKeys
        )
        if (!conditions) return
        if (!parent.relations[name]) return

        collection.clearInternal('__clear_only')

        parent.relations[name]._lazyOperation(function(transOptions) {
          if (options.dependent === 'delete') {
            return options.model.where(conditions).deleteAll(transOptions)
          }
          if (options.dependent === 'destroy') {
            return options.model.where(conditions).destroyAll(transOptions)
          }
          // nullify! -> use only not removed ids
          options.from.forEach(function(key, index) {
            parent[key] = collection
              .map(function(record) {
                if (records.indexOf(record) !== -1) return false
                return record[options.to[index]]
              })
              .filter(function(id) {
                return !!id
              })
          })
          // to need to return parent.save()
          // because lazy operations will be triggered only by parent.save()
          // so it would be a double save...
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
