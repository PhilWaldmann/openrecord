exports.definition = {
  // it's actually a relation helper which adds methods for bulk fetching
  _bulkFetch: function(name, options) {
    const self = this
    const utils = self.store.utils

    // called every time before a parent query occures, with an include of this relation.
    // maybee the conditions of the parent query will contain variables whilch will let us
    // query this relation simultaneously.
    // e.g. Parent.find(99).include('children')
    //      with from: 'id' to: 'parent_id'
    //      99 => is the id!
    options.loadFromConditions =
      options.loadFromConditions ||
      function(parentCollection, parentConditions, include) {
        include = include || {}
        const conditions = utils.parentConditionsToConditions(
          parentConditions || [],
          options.from,
          options.to
        )
        if (!conditions) return

        return defaultFetch(parentCollection, conditions, include)
      }

    // called every time we need to fetch data for that relation
    options.loadFromRecords =
      options.loadFromRecords ||
      function(parentCollection, include, existingCollection) {
        include = include || {}

        const conditions = utils.recordsToConditions(
          parentCollection,
          options.from,
          options.to
        )
        if (!conditions) return Promise.resolve([]) // not enough info to form conditions. Better return an empty result instead of loading the whole dataset!

        return defaultFetch(
          parentCollection,
          conditions,
          include,
          existingCollection
        ).then(function(result) {
          // add the result to corresponding record
          parentCollection.forEach(function(record) {
            record.relations[name] = options.filterCache(record, result)
          })

          return result
        })
      }

    function defaultFetch(
      parentCollection,
      conditions,
      include,
      existingCollection
    ) {
      const relationCache = parentCollection.getInternal('relation_cache') || {}

      // return cached result, if available!
      if (relationCache[options.name]) {
        const result = relationCache[options.name]
        if (!result.then) return Promise.resolve(relationCache[options.name])
        return result
      }

      const query = options.model.where(conditions)
      if (options.conditions) query.where(options.conditions) // conditions on the relation
      if (options.scope) query[options.scope].apply(query, include.args) // scope on the relation
      if (include.conditions) query.where(include.conditions) // nested conditions via `where({relation_name: {...conditions...}})`
      if (include.children) query.include(include.children) // nested includes via `include({relation_name: {nested_relation_name: { ... }}})`
      if (include.scope) query[include.scope].apply(query, include.args) // scope defined via `include({relation_name: {$scope: 'myscope'}})`
      if (existingCollection) {
        const existingConditions = existingCollection.getInternal('conditions')
        const existingIncludes = existingCollection.getInternal('includes')

        if (existingIncludes) query.addInternal('includes', existingIncludes)
        if (existingConditions) {
          // add only new conditions
          const intConditions = query.getInternal('conditions')
          query.addInternal(
            'conditions',
            existingConditions.filter(function(c) {
              if (options.to.indexOf(c.attribute) !== -1) return false // ignore conditions with the target id field. existinCollection will automatically add such an id.

              var match = false
              intConditions.forEach(function(intC) {
                if (options.model.store.utils.compareObjects(c, intC, true))
                  match = true
              })
              return !match
            })
          )
        }

        utils.assignInternals(query, existingCollection, {
          exclude: ['relation', 'relation_to']
        })
      }

      const promise = query.then(function(result) {
        // overwrite cache result
        relationCache[options.name] = result
        return result
      })

      // store the promise in the cache object
      relationCache[options.name] = promise
      parentCollection.setInternal('relation_cache', relationCache)

      return promise
    }

    // called with every parent and child record. returns true/false for matching relations
    options.filterCache =
      options.filterCache ||
      function(parentRecord, records) {
        if (options.model) {
          const chain = options.model.chain()

          if (records) {
            if (!Array.isArray(records)) records = [records]
            const relatedRecords = records.filter(function(record) {
              var match = true

              options.from.forEach(function(key, index) {
                const opposite = options.to[index]
                const val1 = parentRecord[key]
                const val2 = record[opposite]
                if (!utils.checkFieldEquality(val1, val2)) match = false
              })
              return match
            })

            chain.add(relatedRecords) // add all child records
            chain._exists() // set this collection as existing (all records fetched from the datastore!)
          }

          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', parentRecord) // + the parent record

          return chain
        }

        throw new Error('You need to implement your own `filterCache` function!')
      }

    options.getFromCache = function(parentRecord, include, existingCollection) {
      const parentCollection =
        parentRecord.__chainedModel ||
        parentRecord.model.chain().add(parentRecord)

      return options
        .loadFromRecords(parentCollection, include || {}, existingCollection)
        .then(function(result) {
          if (!result) return null
          return options.filterCache(parentRecord, result)
        })
    }

    return options
  }
}
