/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var attributes = this.getCache('attributes')
      if(attributes){
        this.setLoadedAttributes(attributes)
        return next()
      }

      if(!this.table_name) return next()
      var self = this

      attributes = []

      this.store.connection.raw('DESCRIBE ' + this.table_name).asCallback(function(err, response){
        if(err){
          next()
          return self.store.handleException(err)
        }

        var result = response[0]

        for(var i in result){
          var attrDef = {
            name: result[i].Field,
            type: simplifiedType(result[i].Type),
            options: {
              description: null, // TODO
              persistent: true,
              primary: result[i].Key === 'PRI',
              notnull: result[i].Null !== 'YES',
              default: result[i].Default,
              writable: !(result[i].Key === 'PRI' && result[i].Extra === 'auto_increment') // set to false if primary and integer
            },
            validations: []
          }

          if(result[i].Null !== 'YES' && result[i].Key !== 'PRI'){
            attrDef.validations.push({name: 'validatesPresenceOf', args: []})
          }

          attributes.push(attrDef)
        }

        self.setCache('attributes', attributes)
        self.setLoadedAttributes(attributes)
        next()
      })
    }, 80)
  },

  setLoadedAttributes(attributes){
    var self = this

    attributes.forEach(function(attr){
      self.attribute(attr.name, attr.type, attr.options)
      attr.validations.forEach(function(validation){
        self[validation.name].apply(self, [attr.name].concat(validation.args))
      })
    })
  }
}


function simplifiedType(type){
  if(type.toLowerCase() === 'tinyint(1)') type = 'boolean'
  type = type.replace(/\(.+\)/, '').toUpperCase()

  switch(type){
    case 'BIGINT UNSIGNED':
    case 'INT UNSIGNED':
    case 'TINYINT':
    case 'INT':
      return 'integer'


    case 'FLOAT':
      return 'float'

    case 'BOOLEAN':
      return 'boolean'

    case 'DATE':
      return 'date'

    case 'TIME':
      return 'time'

    case 'DATETIME':
      return 'datetime'

    case 'BLOB':
      return 'binary'

    default:
      return 'string'
  }
};
