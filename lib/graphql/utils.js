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
        var key = args
        var attr = definition.attributes[key]
        args = {}
        if(attr) args[key] = attr.type.name
      }

      // object with key = attribute name and value = data type as string (e.g. 'integer', 'string', 'boolean', ...)
      Object.keys(args).forEach(function(name){
        output[name] = {
          type: attributeTypes[args[name]].graphQLType
        }
      })
    }

    return output
  }

}
