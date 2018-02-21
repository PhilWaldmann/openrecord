exports.model = {
  /**
   * returns a string represing the model as a graphql type
   * @param  {Object} options Optional options
   * @param  {String} options.name Overwrite the type name (Default: Model name)
   * @param  {Array} options.exclude Array of fields to exclude
   * @return {String}         The graphql type
   */
  toGraphQLType: function(options){
    options = options || {}
    const exclude = options.exclude || []
    const definition = this.definition
    const result = ['type ' + (options.name || definition.model_name) + ' {']

    Object.keys(definition.attributes).forEach(function(key){
      var attribute = definition.attributes[key]
      if(attribute.hidden) return
      if(exclude.indexOf(key) !== -1) return
      if(!attribute.type.graphQLTypeName) return

      var attr = ['  ']
      attr.push(key)
      attr.push(': ')
      attr.push(attribute.type.graphQLTypeName)
      if(attribute.notnull) attr.push('!')
      if(attribute.comment) attr.push(' # ' + attribute.comment)

      result.push(attr.join(''))
    })

    result.push('}')

    return result.join('\n')
  }
}
