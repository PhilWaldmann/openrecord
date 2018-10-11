exports.utils = {
  toIncludesList: function(includes) {
    const list = []

    if (!includes) return list
    if (!Array.isArray(includes)) includes = [includes]

    includes.forEach(function(item) {
      if (typeof item === 'string') {
        list.push({
          relation: item,
          children: [],
          args: [],
          scope: null,
          conditions: null,
          through: false
        })
        return
      }

      if (Array.isArray(item)) {
        list.push.apply(list, exports.utils.toIncludesList(item))
        return
      }

      if (typeof item === 'object') {
        Object.keys(item).forEach(function(key) {
          var args = []
          var scope
          var conditions

          if (item[key].$args) {
            args = item[key].$args
            if (!Array.isArray(args)) args = [args]
            delete item[key].$args
          }

          if (item[key].$scope) {
            scope = item[key].$scope
            delete item[key].$scope
          }

          if (item[key].$conditions) {
            conditions = item[key].$conditions
            delete item[key].$conditions
          }

          list.push({
            relation: key,
            children: item[key],
            args: args,
            scope: scope,
            conditions: conditions,
            through: false
          })
        })
      }
    })

    return list
  },

  toConditionList: function(conditions, attributes) {
    const self = this
    const list = []
    if (!conditions) return list
    if (!Array.isArray(conditions)) conditions = [conditions]

    // raw condition
    if (typeof conditions[0] === 'string') {
      var query = conditions[0]
      var args = conditions.slice(1)

      if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
        // if we got e.g. ["login = :login", {login:"phil"}]
        var values = args[0]
        args = []
        query = query.replace(/:(\w+)/g, function(res, field) {
          args.push(values[field])
          return '?' // use a questionmark as a placeholder...
        })
      }

      list.push({
        type: 'raw',
        query: query,
        args: args
      })

      return list
    }

    conditions.forEach(function(item) {
      // nested arrays. ignore them and resolve the inner items
      if (Array.isArray(item)) {
        list.push.apply(list, self.toConditionList(item, attributes))
        return
      }

      if (item === undefined || item === null) return

      // conditions via object. e.g. `{title_like: 'foo'}`
      // here we need the attributes to check if it's a relation or an attribute with or without operator
      if (typeof item === 'object') {
        Object.keys(item).forEach(function(key) {
          const value = item[key]
          var foundAttribute = false

          // sort arrtibutes by string length. largest first!
          // to avoid conflicts with similar names and conditions.
          // e.g. ['text', 'text_long'] and condition {text_long_like: 'foo'}
          attributes = attributes.sort(function(a, b){
            if(a.length < b.length) return 1
            if(a.length > b.length) return -1
            return 0
          })

          attributes.forEach(function(existingAttribute) {
            if (foundAttribute) return

            // e.g. {title: 'openrecord'} => direct condition
            if (key === existingAttribute) {
              list.push({
                type: 'hash',
                attribute: existingAttribute,
                operator: null, // use default
                value: value
              })
              foundAttribute = true
              return
            }

            // e.g. {title_like: 'open'} => condition with operator
            if (key.indexOf(existingAttribute + '_') === 0) {
              list.push({
                type: 'hash',
                attribute: existingAttribute,
                operator: key.replace(existingAttribute + '_', ''),
                value: value
              })
              foundAttribute = true
            }
          })

          // if we did not find an attribute
          // it's maybee a conditions for a relation. `where()` will check that for us and throw an error if not!
          if (!foundAttribute) {
            list.push({
              type: 'relation',
              relation: key,
              value: value
            })
          }
        })
      }
    })

    return list
  },

  assignInternals: function(targetChain, sourceChain, options) {
    options = options || {}
    const target = targetChain._internal_attributes
    const source = sourceChain._internal_attributes
    const exclude = options.exclude || []

    Object.keys(source).forEach(function(key) {
      if (exclude.indexOf(key) !== -1) return

      if (options.overwrite || !target[key] || (Array.isArray(target[key]) && target[key].length === 0)) {        
        target[key] = source[key]
      }
    })
  }
}
