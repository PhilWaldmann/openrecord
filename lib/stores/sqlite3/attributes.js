/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){

      var self = this;

      this.store.connection.raw("PRAGMA table_info('" + this.table_name + "')")
      .then(function(result){
        for(var i in result){
          var _default = result[i].dflt_value;
          if(_default) _default = _default.replace(/(^'|'$)/g, '');

          self.attribute(result[i].name, simplified_type(result[i].type), {
            persistent: true,
            primary: result[i].pk != 0,
            notnull: result[i].notnull == 1,
            default: _default,
            writable: !(result[i].pk != 0 && result[i].type.toLowerCase() == 'integer') //set to false if primary and integer
          });

          if(result[i].notnull == 1 && result[i].pk == 0){
            self.validatesPresenceOf(result[i].name);
          }
        }

        next();
      })
      .catch(function(error){
        next();
        return self.store.handleException(err);
      });

    }, 80);

  }
};


function simplified_type(type){
  type = type.replace(/\(.+\)/, '').toUpperCase();
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
      return 'integer';

    case 'REAL':
    case 'DOUBLE':
    case 'DOUBLE PRECISION':
    case 'FLOAT':
    case 'NUMERIC':
    case 'DECIMAL':
      return 'float';

    case 'BOOLEAN':
      return 'boolean';

    case 'DATE':
      return 'date';

    case 'DATETIME':
      return 'datetime';

    default:
      return 'string';
  }
};
