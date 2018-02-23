exports.model = {
  /**
   * returns a string represing the model as a graphql type
   * @param  {Object} options Optional options
   * @param  {String} options.name Overwrite the type name (Default: Model name)
   * @param  {String} options.description Set a description for the type
   * @param  {Array} options.exclude Array of fields to exclude
   * @return {String}         The graphql type
   */
  toGraphQLType: function(options){
    options = options || {}
    const exclude = options.exclude || this.definition.graphqlHelper.exclude || []
    const definition = this.definition
    const result = []
    const customDone = {}

    // TODO: Load description from database if supported (e.g. Postgres)
    options.description = options.description || this.definition.graphqlHelper.description

    if(options.description) result.push('# ' + options.description)
    result.push('type ' + (options.name || definition.model_name) + ' {')

    Object.keys(definition.attributes)
    .sort()
    .forEach(function(key){
      var attribute = definition.attributes[key]
      if(attribute.hidden) return // hidden fields are for example auto generated `<relation>_ids` fields
      if(exclude.indexOf(key) !== -1) return
      if(!attribute.type.graphQLTypeName) return // auto generated graphql type via openrecord type
      if(definition.graphqlHelper.fields[key]){
        // field overwrite via this.graphQLField('field definition...')
        result.push('  ' + definition.graphqlHelper.fields[key])
        customDone[key] = true
        return
      }

      var attr = ['  ']
      attr.push(key)
      attr.push(': ')
      attr.push(attribute.type.graphQLTypeName)
      if(attribute.notnull) attr.push('!')
      if(attribute.comment) attr.push(' # ' + attribute.comment)

      result.push(attr.join(''))
    })

    Object.keys(definition.graphqlHelper.fields).forEach(function(key){
      if(customDone[key]) return
      result.push('  ' + definition.graphqlHelper.fields[key])
    })

    result.push('}')

    return result.join('\n')
  }
}
