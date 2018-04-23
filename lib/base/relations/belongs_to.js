const inflection = require('inflection')

exports.definition = {
  belongsTo: function(name, options) {
    const definition = this
    const utils = this.store.utils

    options = options || {}
    options.type = 'belongs_to'

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
              key
            if (!definition.attributes[fromKey]) fromKey = name + '_' + key
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
            value
          ) {
            if (this[attributeName] !== value) {
              // remove loaded relation if key changed!
              this.relations[name] = undefined
            }
          })
        })
      }

    // belongsTo relation only returns a single record!
    options.transform =
      options.transform ||
      function(result) {
        if (!result) return
        return result[0] || null
      }

    options.setter =
      options.setter ||
      function(record) {
        if (this.relations[name] && record === this.relations[name][0]) return

        var chain = this.relations[name]

        // if no relational data exists (e.g. Parent.new())
        // create a new collection
        if (!chain) {
          chain = options.model.chain()
          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', this) // + the parent record
          options.setResult(this, chain)
        }

        if (Array.isArray(record)) record = record[0]

        if (record === null) {
          this[options.from] = null
        } else {
          chain.remove(0)
          chain.add(record)
        }
        chain._resolved()
      }

    // add a single record
    options.add =
      options.add ||
      function(parent, record) {
        record.set(options.conditions) // add relation conditions to record. Will only work in `equality` conditions. e.g. {type: 'Foo'}
        options.to.forEach(function(key, index) {
          const opposite = options.from[index]
          parent[opposite] = record[key]
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
        // ignore `nullify` on belongs to relation -> got deleted anyways
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
          options.from.forEach(function(key) {
            parent[key] = null
          })
          // to need to return parent.save()
          // because lazy operations will be triggered only by parent.save()
          // so it would be a double save...
        })
      }

    return this.relation(name, options)
  }
}
