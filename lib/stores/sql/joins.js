/*
 * MODEL
 */
exports.model = {
  /**
   * Joins one or multiple relations with the current model
   * @class Model
   * @method join
   * @param {string} relation - The relation name which should be joined.
   * @param {string} type - Optional join type (Allowed are `left`, `inner`, `outer` and `right`).
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  join: function(relations, type) {
    const Utils = this.definition.store.utils
    const self = this.chain()._unresolve()

    var args = Utils.args(arguments)
    const existingJoins = self.getInternal('joins') || []
    const existingMap = {}

    existingJoins.forEach(function(inc) {
      existingMap[inc.relation] = inc
    })

    if (
      type &&
      ['left', 'inner', 'outer', 'right'].indexOf(type.toLowerCase()) !== -1
    ) {
      args = relations
    } else {
      type = 'inner' // default join!
    }

    const joins = Utils.toJoinsList(args)

    joins.forEach(function(join) {
      join.type = join.type || type

      const relation = self.definition.relations[join.relation]

      if (relation) {
        if (existingMap[join.relation]) return // ignore duplicated joins
        if (relation.type === 'belongs_to_polymorphic')
          throw new Error("Can't join polymorphic relations")
        if (relation.through) join.through = true

        self.addInternal('joins', join)
        return
      }

      if (join.type === 'raw') {
        self.addInternal('joins', join)
        return
      }

      throw new Error(
        'Can\'t find relation "' +
          join.relation +
          '" for ' +
          self.definition.modelName
      )
    })

    return self
  },

  /**
   * Left joins one or multiple relations with the current model
   * @class Model
   * @method leftJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  leftJoin: function() {
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'left')
  },

  /**
   * Right joins one or multiple relations with the current model
   * @class Model
   * @method rightJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  rightJoin: function() {
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'right')
  },

  /**
   * Inner joins one or multiple relations with the current model
   * @class Model
   * @method innerJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  innerJoin: function() {
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'inner')
  },

  /**
   * Outer joins one or multiple relations with the current model
   * @class Model
   * @method outerJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  outerJoin: function() {
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'outer')
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    const Utils = this.store.utils
    const self = this

    this.autojoin = {}

    this.onRelationCondition(function(chain, condition) {
      const joins = chain.getInternal('joins') || []
      var found = false
      // just add the condition to the include/join object
      // which will be handled by the relation
      joins.forEach(function(item) {
        if (item.relation === condition.relation) {
          item.conditions = item.conditions || []
          item.conditions.push(condition.value)
          found = true
        }
      })

      // if autoJoin is enabled...
      if (!found && self.autojoin.enabled) {
        chain.join(condition.relation)
        return chain.callInterceptors('onRelationCondition', [chain, condition])
      }
    })

    // take all through relations first, because they will add additional includes
    this.beforeFind(function(query) {
      const collection = this
      const joins = this.getInternal('joins') || []
      const select = this.getInternal('select') || []
      const parentRelations = this.getInternal('parent_relations')
      const mapping = this.getInternal('join_mapping') || {
        customSelect: select.length > 0,
        selectIndex: 0,
        select: [],
        attributes: {}
      }
      this.setInternal('join_mapping', mapping)

      if (joins.length === 0) return

      // check for relations which could be preloaded!
      joins.forEach(function(join) {
        if (!join.through) return // will be handled by comming beforeFind

        const relation = collection.definition.relations[join.relation]
        relation.sqlJoin.call(collection, query, join, mapping, parentRelations)
      })
    }, -10)

    this.beforeFind(function(query) {
      const jobs = []
      const collection = this
      const joins = this.getInternal('joins') || []
      if (joins.length === 0) return

      const parentRelations = this.getInternal('parent_relations')
      const mapping = this.getInternal('join_mapping')
      const hasSelects = this.getInternal('hast_selects')
      const hasAggregates = this.getInternal('has_aggegrates')
      const isRootQuery = !parentRelations
      const normalJoins = joins.filter(function(join) {
        return join.type !== 'raw'
      }).length

      if (!mapping.customSelect) {
        if (isRootQuery && normalJoins > 0) {
          // if it's the root model of the join!
          mapping.select = mapping.select.concat(
            Utils.getAttributeColumns(self, mapping, [self.tableName], true)
          )
        }
      } else {
        this.asRaw()
      }

      joins.forEach(function(join) {
        if (join.through) return // was handled by other beforeFind

        if (join.type === 'raw') {
          query.joinRaw(join.query, join.args)
        } else {
          const relation = self.relations[join.relation]

          if (typeof relation.sqlJoin === 'function') {
            jobs.push(
              relation.sqlJoin.call(
                collection,
                query,
                join,
                mapping,
                parentRelations
              )
            )
          } else {
            throw new Error("Can't join '" + relation.name + '" relation')
          }
        }
      })

      return this.store.utils.parallel(jobs).then(function() {
        if (isRootQuery) {
          if (!hasSelects && !hasAggregates) {
            collection.setInternal('has_join_selects', true)
            // add `select` columns
            query.select(mapping.select)
          } else {
            collection.asJson()
          }
        }
      })
    }, -20)

    this.afterFind(function(data) {
      const joins = this.getInternal('joins') || []
      const joinMapping = this.getInternal('join_mapping')
      const hasJoinSelects = this.getInternal('has_join_selects')
      
      if (!data.result) return
      if (joins.length === 0) return
      if (!hasJoinSelects) return
      if (joinMapping.customSelect) return
      
      data.result = Utils.hydrateJoinResult(data.result, joinMapping.attributes)
    }, 90)
  },

  /**
   * Enable automatic joins on tables referenced in conditions
   * @class Definition
   * @method autoJoin
   * @param {object} options - Optional configuration options
   *
   * @options
   * @param {array} relations - Only use the given relations for the automatic joins.
   *
   * @return {Definition}
   */
  autoJoin: function(options) {
    this.autojoin = options || {}
    this.autojoin.enabled = true
    this.autojoin.relations = this.autojoin.relations || []
    return this
  }
}
