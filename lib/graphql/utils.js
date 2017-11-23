const graphql = require('graphql')

exports.utils = {

  sanitizeArgs: function(definition, args){
    var self = this
    var attributeTypes = definition.store.attribute_types
    var output = {}

    if(args){
      // array with a combination of the below. e.g. ['id', 'writable_attributes', {foo: 'string'}]
      if(args instanceof Array){
        args.forEach(function(item){
          Object.assign(output, self.sanitizeArgs(definition, item))
        })
        return output
      }

      // all writable attributes
      if(args === 'writable_attributes'){
        args = {}
        Object.keys(definition.attributes).forEach(function(key){
          var attr = definition.attributes[key]
          if(attr.writable) args[key] = attr.type.name
        })
      }

      // all readable attributes
      if(args === 'readable_attributes'){
        args = {}
        Object.keys(definition.attributes).forEach(function(key){
          var attr = definition.attributes[key]
          if(attr.readable) args[key] = attr.type.name
        })
      }

      // any model attribute
      if(typeof args === 'string'){
        var key = args.replace(/!$/, '')
        var attr = definition.attributes[key]
        var required = !!args.match(/!$/)

        args = {}

        if(attr) {
          args[key] = {
            type: attr.type.name,
            required: required,
            description: attr.description
          }
        }
      }

      // object with key = attribute name and value = data type as string (e.g. 'integer', 'string', 'boolean', ...)
      Object.keys(args).forEach(function(name){
        var type = args[name]
        var required = false
        var description
        var defaultValue

        if(args[name] && typeof args[name] === 'object' && args[name].type){ // {attribute_name: {type: 'string', required: true}}
          type = args[name].type
          required = args[name].required
          description = args[name].description
          defaultValue = args[name].defaultValue
        }

        if(attributeTypes[type]){
          var graphqlType = attributeTypes[type].graphQLType
          if(required){
            graphqlType = new graphql.GraphQLNonNull(graphqlType)
          }

          output[name] = {
            type: graphqlType,
            description: description,
            defaultValue
          }
        }
      })
    }

    return output
  }

}
