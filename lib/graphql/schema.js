const graphql = require('graphql')
const inflection = require('inflection')
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
        store.generateGraphQLTypes()
        store.graphqlSchema = store.generateGraphQLSchema()
      })
    })
  },



  /*
  GraphQLBoolean
  GraphQLEnumType
  GraphQLFloat
  GraphQLID
  GraphQLInputObjectType
  GraphQLInt
  GraphQLInterfaceType
  GraphQLList
  GraphQLNonNull
  GraphQLObjectType
  GraphQLScalarType
  GraphQLSchema
  GraphQLString
  GraphQLUnionType
   */
  generateGraphQLTypes(){
    var store = this

    Object.keys(this.attribute_types).forEach(function(key){
      var typeDef = store.attribute_types[key]
      var name = typeDef.name
      var type = typeDef.graphQLType
      var isList = false

      if(/^\w+_array$/.test(name)){
        type = name.replace('_array', '')
        isList = true
      }

      switch(name){
        case String:
        case 'string':
        case 'text':
          type = graphql.GraphQLString
          break

        case 'integer':
          type = graphql.GraphQLInt
          break

        case Number:
        case 'float':
          type = graphql.GraphQLFloat
          break

        case Boolean:
        case 'boolean':
          type = graphql.GraphQLBoolean
          break

        case Array:
          isList = true
          type = graphql.GraphQLString // TODO...
          break
        case Object:
          name = 'object'
          break
        case Date:
          name = 'date'
          break
        case Buffer:
          name = 'buffer'
          break
      }

      if(!type){
        type = new graphql.GraphQLScalarType({
          name: inflection.camelize(name),
          serialize: typeDef.cast.output,
          parseValue: typeDef.cast.input,
          parseLiteral(ast) {
            return typeDef.cast.input(ast.value)
          }
        })
      }

      if(isList){
        type = new graphql.GraphQLList(type)
      }

      typeDef.graphQLType = type
    })
  },


  generateGraphQLSchema(){
    var store = this
    var modelGetter = {}

    Object.keys(this.models).forEach(function(modelName){
      var Model = store.models[modelName]
      var Type = Model.definition.getGraphQLObjectType()

      // get by id
      modelGetter[modelName] = {
        type: Type,
        description: 'Get single ' + modelName + ' by id',
        args: {
          id: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
        },
        resolve: function(source, args, context, info){
          return Model.find(args.id).exec()
        }
      }

      // get list
      modelGetter[inflection.pluralize(modelName)] = {
        type: new graphql.GraphQLList(Type),
        description: 'Get all ' + inflection.pluralize(modelName),
        resolve: function(source, args, context, info){
          var query = Model

          query = query.include(toInclude(Model, info.fieldNodes[0].selectionSet.selections))

          return query.exec()
        }
      }
    })


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
      includes[relation.name] = toInclude(relation.model, node.selectionSet.selections)
    }
  })

  return includes
}






exports.definition = {

  mixinCallback: function(){
    this.graphqlGetter = {}
  },

  getter: function(name, fn, returnType){
    if(returnType){
      this.graphqlGetter[name] = returnType
    }

    return this.callParent(name, fn)
  },


  getGraphQLObjectType: function(){
    if(this.graphQLObjectType) return this.graphQLObjectType
    var self = this

    this.graphQLObjectType = new graphql.GraphQLObjectType({
      name: this.model_name,

      fields: function(){
        var fields = {}

        // add model attributes
        Object.keys(self.attributes).forEach(function(key){
          fields[key] = {
            type: self.attributes[key].type.graphQLType
          }
        })

        // add additional model getters
        Object.keys(self.graphqlGetter).forEach(function(key){
          var type = self.graphqlGetter[key]
          var typeDef = self.store.attribute_types[type]
          var graphqlType

          if(typeDef){
            graphqlType = typeDef.graphQLType
          }else{
            if(type instanceof graphql.GraphQLScalarType){
              graphqlType = type
            }
          }

          fields[key] = {
            type: graphqlType
          }
        })


        // add relations
        // polymorph => GraphQLUnionType
        Object.keys(self.relations).forEach(function(key){
          var relation = self.relations[key]
          var Type = relation.model.definition.getGraphQLObjectType()

          if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
            Type = new graphql.GraphQLList(Type)
          }

          fields[key] = {
            type: Type
          }
        })

        return fields
      }
    })

    return this.graphQLObjectType
  }
}
