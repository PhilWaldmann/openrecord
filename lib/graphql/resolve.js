exports.store = {
  resolveHelper: function(fn){
    return function(source, args, context, info){
      const query = fn(args)

      if(info.operation.operation === 'mutation'){
        return query.then(function(query){
          if(!query || !query.include) return query

          return query
          .include(toInclude(query.model, info))
          .setContext(context)
        })
      }

      return query
      .include(toInclude(query.model, info))
      .setContext(context)
    }
  }
}


function toInclude(Model, info){
  if(!info.fieldNodes || !info.fieldNodes[0] || !info.fieldNodes[0].selectionSet) return

  var nodes = info.fieldNodes[0].selectionSet.selections
  return toIncludeHelper(Model, nodes)
}


function toIncludeHelper(Model, nodes){
  var definition = Model.definition
  var includes = {}

  nodes.forEach(function(node){
    var relation = definition.relations[node.name.value]
    if(relation){
      var args

      // transform node.agurments to hash
      if(node.arguments && node.arguments.length > 0){
        args = {}
        node.arguments.forEach(function(argument){
          args[argument.name.value] = argument.value.value
        })
      }

      if(node.selectionSet) includes[relation.name] = toIncludeHelper(relation.model, node.selectionSet.selections)

      if(args){
        // add args to includes object - with $args: ...
        includes[relation.name] = includes[relation.name] || {}
        includes[relation.name].$args = args
      }else{
        includes[relation.name] = includes[relation.name] || true
      }
    }
  })

  return includes
}
