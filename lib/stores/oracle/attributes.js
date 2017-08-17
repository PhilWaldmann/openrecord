/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this
      this.store.connection.raw('SELECT column_name, data_type, data_precision, data_scale, data_length FROM user_tab_columns WHERE table_name = \'' + this.table_name + '\'').asCallback(function(err, result){
        if(err){
          next()
          return self.store.handleException(err)
        }

        for(var i in result){
          var attr = result[i]
          self.attribute(result[i].COLUMN_NAME, simplifiedType(attr.DATA_TYPE, attr.DATA_PRECISION, attr.DATA_SCALE), {
            persistent: true,
            primary: false, // result[i].Key === 'PRI',
            notnull: false, // result[i].Null !== 'YES',
            default: null, // result[i].Default,
            writable: true // !(result[i].Key === 'PRI' && result[i].Extra === 'auto_increment') // set to false if primary and integer
          })

          // if(result[i].Null !== 'YES' && result[i].Key !== 'PRI'){
          //   self.validatesPresenceOf(result[i].Field)
          // }
        }

        next()
      })
    }, 80)
  }
}


function simplifiedType(type, precision, scale){
  type = type.replace(/\(.+\)/, '').toUpperCase()

  switch(type){
    case 'NUMBER':
      if(precision && scale) return 'float'
      return 'integer'

    case 'DATE':
      return 'date'

    case 'TIMESTAMP':
      return 'datetime'

    case 'BLOB':
      return 'binary'

    default:
      return 'string'
  }
};
