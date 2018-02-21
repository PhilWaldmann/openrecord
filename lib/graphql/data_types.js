
exports.store = {
  mixinCallback: function(){
    var store = this
    store.generateGraphQLTypes()
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
  generateGraphQLTypes: function(){
    var store = this
    Object.keys(this.attribute_types).forEach(function(key){
      var typeDef = store.attribute_types[key]
      var name = typeDef.name
      var type = typeDef.graphQLType
      var isList = false

      if(/^\w+_array$/.test(name)){
        name = name.replace('_array', '')
        isList = true
      }

      switch(name){
        case String:
        case 'string':
        case 'text':
          type = 'String'
          break

        case 'integer':
          type = 'Int'
          break

        case Number:
        case 'float':
          type = 'Float'
          break

        case Boolean:
        case 'boolean':
          type = 'Boolean'
          break

        case Array:
          isList = true
          type = 'String' // TODO...
          break
      }

      if(isList){
        type = '[' + type + ']'
      }

      typeDef.graphQLTypeName = type
    })
  }
}
