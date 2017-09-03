const graphql = require('graphql')
const Store = require('../store')

exports.definition = {
  getGraphQLObjectType: function(){
    if(this.graphQLObjectType) return this.graphQLObjectType
    var self = this
    var attributeTypes = self.store.attribute_types

    this.graphQLObjectType = new graphql.GraphQLObjectType({
      name: this.model_name,

      fields: function(){
        var fields = {}

        // add model attributes
        Object.keys(self.attributes).forEach(function(key){
          var attribute = self.attributes[key]
          var field = {
            type: attribute.type.graphQLType,
            description: attribute.description
          }

          if(attribute.variant){
            var args = {}
            Object
              .keys(attribute.variant.args)
              .forEach(function(key){
                var type = self.store.attribute_types[attribute.variant.args[key]]
                if(!type) return this.handleException(new Store.UnknownAttributeTypeError(attribute.variant.args[key]))
                args[key] = {type: type.graphQLType}
              })
            field.args = args
            field.resolve = function(source, args){
              return source[key + '$'](args)
            }
          }

          fields[key] = field
        })

        // add model methods
        Object.keys(self.record_methods).forEach(function(key){
          var method = self.record_methods[key]
          var options = method.options

          if(options && options.return_type){
            var argsMapping = options.args_mapping
            var field = {
              type: attributeTypes[options.return_type].graphQLType,
              description: options.description
            }

            if(options.args){
              var args = {}
              Object.keys(options.args).forEach(function(name){
                args[name] = {
                  type: attributeTypes[options.args[name]].graphQLType
                }
              })

              field.args = args
            }

            field.resolve = function(source, args, context, info){
              if(argsMapping){
                var argsArray = argsMapping.map(function(name){
                  return args[name]
                })
                return method.apply(source, argsArray)
              }else{
                return method.call(source, args)
              }
            }

            fields[key] = field
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
        // TODO: polymorph => GraphQLUnionType
        Object.keys(self.relations).forEach(function(key){
          var relation = self.relations[key]
          if(!relation.model || !relation.model.definition.getGraphQLObjectType) return

          var Type = relation.model.definition.getGraphQLObjectType()
          var field = {}

          if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
            Type = new graphql.GraphQLList(Type)
          }


          if(relation.scope){
            var fn = relation.model[relation.scope]
            if(fn && fn.options){
              if(fn.options.return_type) Type = attributeTypes[fn.options.return_type].graphQLType
              if(fn.options.args){
                var args = {}
                Object.keys(fn.options.args).forEach(function(name){
                  args[name] = {
                    type: attributeTypes[fn.options.args[name]].graphQLType
                  }
                })

                field.args = args
              }
            }
          }

          field.type = Type

          fields[key] = field
        })

        return fields
      }
    })

    return this.graphQLObjectType
  }
}
