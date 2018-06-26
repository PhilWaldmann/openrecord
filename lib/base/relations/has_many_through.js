exports.definition = {
  // it's actually a relation helper which overwrites the preInitialize, loadFromConditions, loadFromRecords and filter methods
  _hasManyThrough: function(name, options) {
    const self = this
    const utils = this.store.utils

    options.preInitialize = function() {
      options.relation = options.relation || name
      options.from = []
      options.to = []

      if (!Array.isArray(options.through)) options.through = [options.through]

      // add the last relation name for easier looping
      options.through.push(options.relation)

      var tmpDefinition = self
      var targetRelation
      var relation

      // find the last relation of the through list
      for (var index = 0; index < options.through.length; index++) {
        const relationName = options.through[index]

        if (!tmpDefinition)
          throw new Error(
            "Can't create a `through` relation through a `has` or `belongs_to_polymorphic` relation'"
          )

        relation = tmpDefinition.relations[relationName]
        if (!relation)
          throw new Error(
            "Can't find relation '" +
              relationName +
              "' on model " +
              tmpDefinition.modelName
          )
        if (relation === options) throw new Error('Relation loop detected!')
        if (relation.type === 'has')
          throw new Error(
            "Can't create a `through` relation through a `has` relation'"
          )

        relation.init()

        // in case we have a nested through relation
        if (relation.through) {
          options.through.splice.apply(
            options.through,
            [index, 1].concat(relation.through)
          )
          index += relation.through.length - 1
        }

        targetRelation = relation
        if (relation.model) tmpDefinition = relation.model.definition
      }

      options.targetRelation = targetRelation
      if (relation.model) options.model = relation.model
    }

    options.rawGetter = function() {
      var result = this.relations[name]

      if (result === undefined) {
        if (this['_' + options.through[0]] === undefined) return // through relation is not loaded, so we can't filter it

        result = options.filterCache(this)
        options.setResult(this, result)
      }

      if (typeof options.transform === 'function') {
        return options.transform(result)
      }
      return result
    }

    // does not load anything, but we use it to set the original includes
    options.loadFromConditions = function(
      parentCollection,
      parentConditions,
      include
    ) {
      const includes = {}
      var tmpIncludes = includes

      // convert the array of through relations to an object.
      // e.g. ['a', 'b'] => {a: {b: {}}}
      options.through.forEach(function(relationName, index) {
        tmpIncludes[relationName] = {}

        // add sub includes
        if (index === options.through.length - 1 && include.children) {
          tmpIncludes[relationName] = include.children
        }

        tmpIncludes = tmpIncludes[relationName]
      })

      if (include.conditions) tmpIncludes.$conditions = include.conditions
      if (options.scope) tmpIncludes.$scope = options.scope
      if (include.args)
        tmpIncludes.$args = Array.isArray(include.args)
          ? include.args
          : [include.args]

      // include `through` relations instead
      parentCollection.include(includes)
    }

    options.loadFromRecords = function(parentCollection, include) {
      return Promise.resolve([]) // no need to load anything. `loadFromConditions` (via include) or `loadWithCollection` will handle all loading!
    }

    options.loadWithCollection = function(collection) {
      const parent = collection.getInternal('relation_to') || self.model.new(collection.getInternal('cloned_relation_to'))
      const chain = self.relations[options.through[0]].collection(parent)

      utils.assignInternals(chain, collection)
      collection.runScopes() // run scopes on original connection to check if it should return raw results

      const includes = {}
      const asRaw = collection.getInternal('as_raw')
      const joinOrInclude = asRaw ? 'join' : 'include'
      var tmpIncludes = includes

      // convert the array of through relations to an object.
      options.through.slice(1).forEach(function(relationName, index) {
        tmpIncludes[relationName] = {}
        tmpIncludes = tmpIncludes[relationName]
      })

      if (options.scope) tmpIncludes.$scope = options.scope
      
      chain.setInternal('through', options.through)
      if(asRaw) chain.clearInternal('relation')
      
      return chain[joinOrInclude](includes).then(function(result) {        
        if (asRaw) return result
        return options.filterCache(parent)
      })
    }

    options.filterCache = function(parentRecord) {
      var tmpRecords = [parentRecord]
      options.through.forEach(function(relationName) {
        const tmp = []
        tmpRecords.forEach(function(record) {
          const child = record['_' + relationName]

          if (!child) return

          if (Array.isArray(child)) tmp.push.apply(tmp, child)
          else tmp.push(child)
        })
        tmpRecords = tmp
      })
      const throughRecords = tmpRecords

      if (options.model) {
        const chain = options.model.chain()

        chain.add(throughRecords) // add all child records
        chain.setInternal('relation', options) // add the parent relation of this collection
        chain.setInternal('relation_to', parentRecord) // + the parent record
        chain._resolved() // set this collection as existing (all records fetched from the datastore!)

        if (options.type === 'has_one') return chain[0]
        return chain
      }

      if (options.type === 'has_one') return throughRecords[0]
      return throughRecords
    }

    options.collection = function(parentRecord) {
      if (options.targetRelation) {
        const chain = options.targetRelation.collection(parentRecord)
        chain.setInternal('relation', options) // add the parent relation of this collection
        chain.setInternal('relation_to', parentRecord) // + the parent record
        return chain
      }
      throw new Error(
        'You need to implement your own `collection` function! (relation: ' +
          name +
          ')'
      )
    }

    options.add = function(parent, record) {
      if (options.through.length > 2)
        throw new Error(
          "Doesn't not work with a has many through over " +
            options.through.length +
            ' relations!'
        )

      // add records to the other relation
      const newRecord = {}
      newRecord[options.through[1]] = record
      parent[options.through[0]].add(newRecord)
    }

    // clear all records
    options.clear = function(parent, collection) {
      if (options.through.length > 2)
        throw new Error(
          "Doesn't not work with a has many through over " +
            options.through.length +
            ' relations!'
        )

      const through = options.through[0]
      var throughRel = parent.relations[through]
      if (!throughRel) {
        throughRel = parent[through]
        self.relations[through].setResult(parent, throughRel)
      }
      throughRel.clear()
    }

    options.afterSave = function(parent, saveOptions) {
      // will be handled by the real relations
    }

    return options
  }
}
