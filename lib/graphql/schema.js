const graphql = require('graphql')
const Store = require('../store')


Store.addExceptionType(function GraphQLSchemaNotDefined(){
  Error.apply(this)
  this.message = 'The GraphQL schema is not defined. Wait until the store is `.ready(fn)`'
})



exports.store = {
  mixinCallback: function(){
    var store = this
    process.nextTick(function(){
      store.ready(function(){
        store.graphqlSchema = store.generateGraphQLSchema()
      })
    })
  },



  generateGraphQLSchema(){
    var store = this
    var modelGetter = {}

    Object.keys(this.graphqlRoots).forEach(function(name){
      var options = this.graphqlRoots[name]

      if(options.model){
        var Model = options.model
        var definition = Model.definition
        var Type = definition.getGraphQLObjectType()
        var fnOpts = Model[options.scope].options
        var args = {}
        var argsMapping = fnOpts.args_mapping
        var attributeTypes = definition.store.attribute_types

        if(options.type === 'list'){
          Type = new graphql.GraphQLList(Type)
        }

        if(fnOpts.return_type){
          Type = attributeTypes[fnOpts.return_type].graphQLType
        }

        if(fnOpts.args){
          Object.keys(fnOpts.args).forEach(function(name){
            args[name] = {
              type: attributeTypes[fnOpts.args[name]].graphQLType
            }
          })
        }


        modelGetter[name] = {
          type: Type,
          description: options.description,
          args: args,
          resolve: function(source, args, context, info){
            var query

            if(argsMapping){
              var argsArray = argsMapping.map(function(name){
                return args[name]
              })
              query = Model[options.scope].apply(Model, argsArray)
            }else{
              query = Model[options.scope](args)
            }

            query = query.setContext(context)

            if(!info.fieldNodes[0] || !info.fieldNodes[0].selectionSet) return query.exec()

            return query
              .include(toInclude(Model, info.fieldNodes[0].selectionSet.selections))
              .exec()
          }
        }
      }else{
        modelGetter[name] = options.fn.bind(store)
      }
    }, this)


    return new graphql.GraphQLSchema({
      query: new graphql.GraphQLObjectType({
        name: 'schema',
        fields: modelGetter
      })
    })
  },

  query: function(query){
    if(!this.graphqlSchema) return this.handleException(new Store.GraphQLSchemaNotDefined())

    return graphql.graphql(this.graphqlSchema, query)
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
