/*
 * MODEL
 */
exports.model = {
  /**
   * Include relations into the result
   * @class Model
   * @method include
   * @param {array} includes - array of relation names to include
   * @or
   * @param {object} includes - for nested includes use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  include: function() {
    const Utils = this.definition.store.utils
    const self = this.chain()

    const includes = Utils.toIncludesList(Utils.args(arguments))
    const existingIncludes = self.getInternal('includes') || []
    const existingMap = {}

    existingIncludes.forEach(function(inc) {
      existingMap[inc.relation] = inc
    })

    includes.forEach(function(inc) {
      const relation = self.definition.relations[inc.relation]
      if (relation) {
        if (relation.through) inc.through = true
        if (existingMap[inc.relation]) return // ignore duplicated includes

        self.addInternal('includes', inc)
      } else {
        throw new Error(
          'Can\'t find relation "' +
            inc.relation +
            '" for ' +
            self.definition.modelName
        )
      }
    })

    return self
  }
}

/*
 * RECORD
 */
exports.record = {
  /**
   * Include relations into the result
   * @class Record
   * @method include
   * @param {array} includes - array of relation names to include
   * @or
   * @param {object} includes - for nested includes use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  include: function() {
    var model = this.definition.model
    var collection = model.include.apply(
      model,
      this.definition.store.utils.args(arguments)
    )

    // add the current record to the collection
    collection.addInternal('data_loaded', [this.clearRelations()]) // clear relations for start with a clean record
    collection.first()

    return collection
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    const Utils = this.store.utils

    this.onRelationCondition(function(chain, condition) {
      const includes = chain.getInternal('includes') || []

      // just add the condition to the include/join object
      // which will be handled by the relation
      includes.forEach(function(item) {
        if (item.relation === condition.relation) {
          item.conditions = item.conditions || []
          item.conditions.push(condition.value)
        }
      })
    })

    // take all through relations first, because they will add additional includes
    this.beforeFind(preloadIncludes(Utils, true), -80)
    // loop all normal includes for preloading
    this.onFind(preloadIncludes(Utils, false))

    // access the relation getter
    // which will trigger a data fetch for all records at once (1+1 instead of N+1)
    this.afterFind(function(data) {
      if (!data || !data.result) return

      const self = this
      const records = data.result
      if (!records) return

      const includes = this.getInternal('includes') || []
      const fetch = []

      if (includes.length === 0) return

      includes.forEach(function(inc) {
        if (inc.through) return

        const relation = self.definition.relations[inc.relation]

        if (typeof relation.loadFromRecords === 'function') {
          // load the relation cache, if not yet loaded via preload...
          const result = relation.loadFromRecords(records, inc)

          if (result && result.then) {
            fetch.push(result) // add it to this array for a simultaneous query
          }
          return
        }

        if (typeof relation.loadFromRecord === 'function') {
          // loop all reacords to fire a query per record.
          // it's recommendet to use the loadFromRecords() function
          records.forEach(function(record) {
            // load the relation
            const result = relation.loadFromRecord(record, inc)

            if (result && result.then) {
              fetch.push(result) // add it to this array for a simultaneous query
            }
          })
        }
      })

      return Utils.parallel(fetch)
    }, 50)
  }
}

function preloadIncludes(Utils, through) {
  return function() {
    const self = this
    const includes = this.getInternal('includes') || []
    const conditions = this.getInternal('conditions') || []
    const preload = []

    if (includes.length === 0) return

    // check for relations which could be preloaded!
    includes.forEach(function(inc) {
      if (inc.through !== through) return
      const relation = self.definition.relations[inc.relation]

      if (typeof relation.loadFromConditions === 'function') {
        const result = relation.loadFromConditions(self, conditions, inc)

        if (result && result.then) {
          preload.push(result) // and also add it to this array for a simultaneous query
        }
      }
    })

    return Utils.parallel(preload)
  }
}
