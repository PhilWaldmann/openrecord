exports.store = {
  graphQLResolveHelper: function(fn, allAttributes) {
    return function(source, args, context, info) {
      const query = allAttributes ? fn(source, args, context, info) : fn(args)

      if(info && info.operation.operation === 'mutation' && query.then) {
        return query
        .then(function(query) {
          return addInclude(query, context, info)
        })
      }

      if(query.then && !query.model){
        return query.then(function(result){
          return addInclude(result, context, info)
        })
      }

      return addInclude(query, context, info)
    }
  }
}


function addInclude(query, context, info, sub){
  if(query){
    if(query.model && query.include && (!query.getInternal || !query.getInternal('resolved'))) {
      return query
      .include(toInclude(query.model, info, sub))
      .setContext(context)
    }

    if(typeof query === 'object' && !(query instanceof Array)){
      Object.keys(query).forEach(function(key){
        const tmpSub = (sub || []).concat(key)
        query[key] = addInclude(query[key], context, info, tmpSub)
      })
    }

    if(query instanceof Array){
      query = query.map(function(item){
        return addInclude(item, context, info, sub)
      })
    }
  }

  return query
}


function toInclude(Model, info, sub) {
  if (!info.fieldNodes || !info.fieldNodes[0] || !info.fieldNodes[0].selectionSet) return

  var nodes = info.fieldNodes[0].selectionSet.selections

  if(sub){
    sub.forEach(function(nodeName){
      nodes.forEach(function(node){
        if(node.name.value === nodeName && node.selectionSet) nodes = node.selectionSet.selections
      })
    })
  }

  return toIncludeHelper(Model, nodes)
}


function toIncludeHelper(Model, nodes) {
  var definition = Model.definition
  var includes = {}

  nodes.forEach(function(node) {
    var relation = definition.relations[node.name.value]
    if (relation) {
      var args

      // transform node.agurments to hash
      if (node.arguments && node.arguments.length > 0) {
        args = {}
        node.arguments.forEach(function(argument) {
          args[argument.name.value] = argument.value.value
        })
      }

      if (node.selectionSet) includes[relation.name] = toIncludeHelper(relation.model, node.selectionSet.selections)

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
