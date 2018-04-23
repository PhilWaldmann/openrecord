exports.definition = {
  relation: function(name, options) {
    options = options || {}

    const self = this.callParent(name, options)
    const utils = this.store.utils

    options.sqlJoin =
      options.sqlJoin ||
      function(query, join, joinMapping, parentRelations) {
        parentRelations = (parentRelations || []).concat(name) // add current relation name to the list

        const targetDefinition = options.model.definition
        const conditions = {}

        // create condition object for 'a'.id = 'b'.a_id
        options.from.forEach(function(key, index) {
          conditions[key] = {
            $attribute: options.to[index],
            $parents: parentRelations,
            $model: options.model
          }
        })

        // add join
        const xquery = self.store.connection('x')
        const conditionsList = utils.toConditionList([conditions], options.from)

        return this._applyCondtions(conditionsList, xquery)
          .then(function() {
            const sql = xquery
              .toString()
              .replace(/select \* from .x.( where |)/i, '')
            const alias = utils.toTableName(parentRelations)
            var tableName = targetDefinition.tableName

            if (tableName !== alias) tableName += ' AS ' + alias

            // now put the raw condition query into the join...
            return query[join.type + 'Join'](
              tableName,
              self.store.connection.raw(sql)
            )
          })
          .then(function() {
            if (!joinMapping.customSelect) {
              // add select ('a.id as f0, a.foo as f1, ...')
              joinMapping.select = joinMapping.select.concat(
                utils.getAttributeColumns(
                  targetDefinition,
                  joinMapping,
                  parentRelations
                )
              )
            }

            // nested joins, scopes and more...
            const chain = options.model.chain()

            chain.setInternal('join_mapping', joinMapping)
            chain.setInternal('parent_relations', parentRelations)

            if (options.conditions) chain.where(options.conditions) // conditions on the relation
            if (options.scope) chain[options.scope].apply(chain, join.args) // scope on the relation
            if (join.conditions) chain.where(join.conditions) // nested conditions via `where({relation_name: {...conditions...}})`
            if (join.children) chain.join(join.children, join.type) // nested join via `join({relation_name: {nested_relation_name: { ... }}})`
            if (join.scope) chain[join.scope].apply(chain, join.args) // scope defined via `include({relation_name: {$scope: 'myscope'}})`

            return chain.callInterceptors('beforeFind', [query])
          })
      }

    return self
  },

  _hasManyThrough: function(name, options) {
    options = options || {}
    options.sqlJoin = function(query, join, joinMapping, parentRelations) {
      const joins = {}
      var tmpJoins = joins

      // convert the array of through relations to an object.
      // e.g. ['a', 'b'] => {a: {b: {}}}
      options.through.forEach(function(relationName, index) {
        tmpJoins[relationName] = {}

        // add sub includes
        if (index === options.through.length - 1 && join.children) {
          tmpJoins[relationName] = join.children
        }

        tmpJoins = tmpJoins[relationName]
      })

      if (join.conditions) {
        tmpJoins.$conditions = join.conditions
      }

      // join `through` relations instead
      this.join(joins, join.type)
    }

    return this.callParent(name, options)
  }
}
