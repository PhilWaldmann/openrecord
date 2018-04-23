exports.store = {
  graphQLResolveHelper: function(fn, allAttributes) {
    return function(source, args, context, info) {
      const query = allAttributes ? fn(source, args, context, info) : fn(args)

      if (info && info.operation.operation === 'mutation' && query.then) {
        return query.then(function(query) {
          return addInclude(query, context, info)
        })
      }

      if (query && query.then && !query.model) {
        return query.then(function(result) {
          return addInclude(result, context, info)
        })
      }

      return addInclude(query, context, info)
    }
  }
}

function addInclude(query, context, info, sub) {
  if (query) {
    if (
      query.model &&
      query.include &&
      (!query.getInternal || !query._isResolved())
    ) {
      return query
        .include(toInclude(query.model, info, sub))
        .setContext(context)
    }

    if (typeof query === 'object' && !(query instanceof Array)) {
      Object.keys(query).forEach(function(key) {
        const tmpSub = (sub || []).concat(key)
        query[key] = addInclude(query[key], context, info, tmpSub)
      })
    }

    if (query instanceof Array) {
      query = query.map(function(item) {
        return addInclude(item, context, info, sub)
      })
    }
  }

  return query
}

function toInclude(Model, info, sub) {
  if (
    !info.fieldNodes ||
    !info.fieldNodes[0] ||
    !info.fieldNodes[0].selectionSet
  )
    return

  var nodes = info.fieldNodes[0].selectionSet.selections

  if (sub) {
    sub.forEach(function(nodeName) {
      nodes.forEach(function(node) {
        if (node.name.value === nodeName && node.selectionSet)
          nodes = node.selectionSet.selections
      })
    })
  }

  return toIncludeHelper(Model, nodes, info)
}

function toIncludeHelper(Model, nodes, info) {
  var fragments = info.fragments
  var variables = info.variableValues
  var includes = {}

  nodes.forEach(function(node) {
    if (node.kind === 'FragmentSpread') {
      var fragment = fragments[node.name.value]
      if (fragment.selectionSet) {
        Object.assign(
          includes,
          toIncludeHelper(Model, fragment.selectionSet.selections, info)
        )
      }
      return
    }

    if (node.kind === 'InlineFragment') {
      const modelName = node.typeCondition.name.value
      Model = Model.store.Model(modelName)
      if (node.selectionSet) {
        Object.assign(
          includes,
          toIncludeHelper(Model, node.selectionSet.selections, info)
        )
      }
      return
    }

    if (!Model) return

    var relation = Model.definition.relations[node.name.value]
    if (relation) {
      var args

      relation.init()

      // transform node.agurments to hash
      if (node.arguments && node.arguments.length > 0) {
        args = toInputArgs(node.arguments, variables)
      }

      if (node.selectionSet) {
        if (relation.type === 'belongs_to_polymorphic') {
          includes[relation.name] = toIncludeHelper(
            Model,
            node.selectionSet.selections,
            info
          )
        } else {
          includes[relation.name] = toIncludeHelper(
            relation.model,
            node.selectionSet.selections,
            info
          )
        }
      }

      if (args) {
        // add args to includes object - with $args: ...
        includes[relation.name] = includes[relation.name] || {}
        includes[relation.name].$args = args
      } else {
        includes[relation.name] = includes[relation.name] || true
      }
    }
  })

  return includes
}

function toInputArgs(fields, variables) {
  const args = {}

  fields.forEach(function(field) {
    const value = field.value
    if (value.kind === 'ObjectValue') {
      args[field.name.value] = toInputArgs(field.value.fields, variables)
      return
    }
    if (value.kind === 'Variable') {
      args[field.name.value] = variables[value.name.value]
      return
    }
    args[field.name.value] = field.value.value
  })

  return args
}
