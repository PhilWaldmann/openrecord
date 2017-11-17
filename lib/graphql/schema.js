const graphql = require('graphql')
const Utils = require('../utils')

exports.store = {
  mixinCallback: function(){
    const Store = require('../store')
    Store.addExceptionType(function GraphQLSchemaNotDefined(){
      Error.apply(this)
      this.message = 'The GraphQL schema is not defined. Wait until the store is `.ready(fn)`'
    })
  }
}



exports.store = {
  mixinCallback: function(){
    var store = this
    process.nextTick(function(){
      store.ready(function(){
        store.graphqlSchema = store.generateGraphQLSchema()
      })
    })
  },



  generateGraphQLSchema: function(){
    var query = this.generateGraphQLRoot('query', 'RootQuery')
    var mutation = this.generateGraphQLRoot('mutation', 'Mutation')
    var schema = {}

    if(query) schema.query = query
    if(mutation) schema.mutation = mutation
    if(!query && !mutation) return

    return new graphql.GraphQLSchema(schema)
  },



  generateGraphQLRoot: function(type, name){
    var store = this
    var roots = {}

    Object.keys(this.graphqlRoots).forEach(function(name){
      var options = this.graphqlRoots[name]

      if(options.type !== type) return

      if(options.model){
        var Model = options.model
        var definition = Model.definition
        var Type = definition.getGraphQLObjectType()
        var fnOpts = Model[options.handler].options || {}
        var args = Utils.sanitizeArgs(definition, fnOpts.args)
        var argsMapping = fnOpts.args_mapping
        var attributeTypes = definition.store.attribute_types

        if(options.list){
          Type = new graphql.GraphQLList(Type)
        }

        if(fnOpts.return_type){
          Type = attributeTypes[fnOpts.return_type].graphQLType
        }

        roots[name] = {
          type: Type,
          description: options.description,
          args: args,
          resolve: function(source, args, context, info){
            var query = Model.setContext(context)

            if(argsMapping){
              var argsArray = argsMapping.map(function(name){
                return args[name]
              })
              query = query[options.handler].apply(query, argsArray)
            }else{
              query = query[options.handler](args)
            }

            if(options.type === 'mutation'){
              return query.then(function(query){
                if(!query || !query.include) return query
                return query
                .include(toInclude(Model, info.fieldNodes[0].selectionSet.selections))
                .exec()
              })
            }

            if(!info.fieldNodes[0] || !info.fieldNodes[0].selectionSet) return query.exec()

            return query
            .include(toInclude(Model, info.fieldNodes[0].selectionSet.selections))
            .exec()
          }
        }
      }else{
        roots[name] = options.fn.bind(store)
      }
    }, this)

    var query

    if(Object.keys(roots).length > 0){
      query = new graphql.GraphQLObjectType({
        name: name,
        fields: roots
      })
    }

    return query
  },




  query: function(query, context, variables, operation){
    const Store = require('../store')
    if(!this.graphqlSchema) return this.handleException(new Store.GraphQLSchemaNotDefined())

    return graphql.graphql(this.graphqlSchema, query, null, context, variables, operation)
  }
}




function toInclude(Model, nodes){
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

      if(node.selectionSet) includes[relation.name] = toInclude(relation.model, node.selectionSet.selections)

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
