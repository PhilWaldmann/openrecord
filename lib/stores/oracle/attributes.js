/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this
      console.time(self.table_name)

      this.store.connection.raw([
        'SELECT user_tab_columns.column_name, data_type, data_precision, data_scale, data_length, nullable, user_constraints.constraint_type',
        'FROM user_tab_columns',
        'LEFT JOIN user_cons_columns ON user_cons_columns.table_name = user_tab_columns.table_name AND user_cons_columns.column_name = user_tab_columns.column_name',
        'LEFT JOIN user_constraints ON user_constraints.constraint_name = user_cons_columns.constraint_name',
        'WHERE user_tab_columns.table_name = \'' + this.table_name + '\'',
        'ORDER BY user_tab_columns.COLUMN_ID'
      ].join(' ')).asCallback(function(err, result){
        console.timeEnd(self.table_name)
        if(err){
          next()
          return self.store.handleException(err)
        }

        for(var i in result){
          var attr = result[i]
          var options = {
            persistent: true,
            primary: result[i].CONSTRAINT_TYPE === 'P',
            notnull: result[i].NULLABLE !== 'Y',
            default: null, // result[i].Default,
            writable: !(result[i].CONSTRAINT_TYPE === 'P' && result[i].NULLABLE === 'N') // set to false if primary and not null
          }
          // console.log(result[i].COLUMN_NAME, options, result[i])
          self.attribute(result[i].COLUMN_NAME, simplifiedType(attr.DATA_TYPE, attr.DATA_PRECISION, attr.DATA_SCALE), options)

          if(options.notnull && !options.primary){
            self.validatesPresenceOf(result[i].COLUMN_NAME)
          }
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

    case 'CHAR':
      return 'boolean'

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
