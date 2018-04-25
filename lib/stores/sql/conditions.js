/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.onRawCondition(function(chain, condition, query) {
      for (var i = 0; i < condition.args.length; i++) {
        // Hacky fix for a knex problem!
        // TODO: still necessary?
        if (Array.isArray(condition.args[i])) {
          var len = condition.args[i].length
          condition.args.splice.apply(
            condition.args,
            [i, 1].concat(condition.args[i])
          )

          var index = 0
          condition.query = condition.query.replace(/\?/g, function() {
            if (index === i) {
              var tmp = []
              for (var k = 0; k < len; k++) {
                tmp.push('?')
              }

              index++
              return tmp.join(',')
            }
            index++
            return '?'
          })

          i += len
        }
      }

      if (query) {
        return query.whereRaw(condition.query, condition.args)
      }

      // see sql/group.js: 94
      return function(query) {
        query.whereRaw(condition.query, condition.args)
      }
    })
  }
}
