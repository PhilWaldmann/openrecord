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

      this.store.connection.raw("PRAGMA table_info('" + this.table_name + "')")
        .then(function(result){
          for(var i in result){
            var _default = result[i].dflt_value
            if(_default) _default = _default.replace(/(^'|'$)/g, '')

            var attrDef = {
              name: result[i].name,
              type: simplifiedType(result[i].type),
              options: {
                description: null, // TODO
                persistent: true,
                primary: result[i].pk !== 0,
                notnull: result[i].notnull === 1,
                default: _default,
                writable: !(result[i].pk !== 0 && result[i].type.toLowerCase() === 'integer') // set to false if primary and integer
              },
              validations: []
            }

            if(result[i].notnull === 1 && result[i].pk === 0){
              attrDef.validations.push({name: 'validatesPresenceOf', args: []})
            }

            attributes.push(attrDef)
          }

          self.setCache('attributes', attributes)
          self.setLoadedAttributes(attributes)
          next()
        })
        .catch(function(err){
          next()
          return self.store.handleException(err)
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
  type = type.replace(/\(.+\)/, '').toUpperCase()
  switch(type){
    case 'INT':
    case 'INTEGER':
    case 'TINYINT':
    case 'SMALLINT':
    case 'MEDIUMINT':
    case 'BIGINT':
    case 'UNSIGNED BIG INT':
    case 'INT2':
    case 'INT8':
      return 'integer'

    case 'REAL':
    case 'DOUBLE':
    case 'DOUBLE PRECISION':
    case 'FLOAT':
    case 'NUMERIC':
    case 'DECIMAL':
      return 'float'

    case 'BOOLEAN':
      return 'boolean'

    case 'DATE':
      return 'date'

    case 'DATETIME':
      return 'datetime'

    default:
      return 'string'
  }
};
