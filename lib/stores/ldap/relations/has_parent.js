exports.definition = {
  hasParent: function(name, options) {
    options = options || {}
    options.from = 'parent_dn'
    options.to = 'dn'
    options.bulkFetch = false

    options.loadFromRecord =
      options.loadFromRecord ||
      function(parentRecord, include) {
        if (options.model) {
          const query = options.model.find(parentRecord.parent_dn)
          if (options.conditions) query.where(options.conditions) // conditions on the relation
          if (options.scope) query[options.scope].apply(query, include.args) // scope on the relation
          if (include.conditions) query.where(include.conditions) // nested conditions via `where({relation_name: {...conditions...}})`
          if (include.children) query.include(include.children) // nested includes via `include({relation_name: {nested_relation_name: { ... }}})`
          if (include.scope) query[include.scope].apply(query, include.args) // scope defined via `include({relation_name: {$scope: 'myscope'}})`

          return query.then(function(result) {
            parentRecord.relations[name] = query // result could be a single record, so we assign the query => collection
            return result
          })
        }

        throw new Error(
          'You need to implement your own `loadFromRecord` function! (relation: ' +
            name +
            ')'
        )
      }

    return this.belongsTo(name, options)
  }
}
