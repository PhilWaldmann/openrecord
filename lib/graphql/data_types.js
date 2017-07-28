const graphql = require('graphql')
const inflection = require('inflection')


exports.store = {
  mixinCallback: function(){
    var store = this
    process.nextTick(function(){
      store.ready(function(){
        store.generateGraphQLTypes()
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
  }
}
