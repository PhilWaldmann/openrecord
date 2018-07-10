exports.definition = {
  serialize: function(attribute, serializer) {
    serializer = serializer || JSON

    this.convertOutput(
      attribute,
      function(value) {
        if (value === null) return null
        if (typeof value === 'object') return value
        try {
          return serializer.parse(value)
        } catch (e) {
          throw new Error(
            'Serialize error for attribute "' + attribute + '": ' + e
          )
        }
      },
      false
    )

    this.convertInput(
      attribute,
      function(value) {
        if (value === null) return null
        if (typeof value === 'string') return value
        try {
          return serializer.stringify(value)
        } catch (e) {
          throw new Error(
            'Serialize error for attribute "' + attribute + '": ' + e
          )
        }
      },
      false
    )
    
    return this
  }
}
