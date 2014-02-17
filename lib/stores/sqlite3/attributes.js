/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this;
      
      this.store.connection.raw("PRAGMA table_info('" + this.table_name + "')").exec(function(err, response){
        var result = response[0];

        for(var i in result){
          self.attribute(result[i].name, simplified_type(result[i].type), {
            persistent: true,
            primary: result[i].pk != 0,
            notnull: result[i].notnull == 1,
            default: result[i].dflt_value,
            writable: !(result[i].pk != 0 && result[i].type.toLowerCase() == 'integer') //set to false if primary and integer
          });
                                 
          if(result[i].notnull == 1){
            self.validatesPresenceOf(result[i].name);
          }
        }

        next();
      });
      
    });
    
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
      return 'INTEGER';

    case 'REAL':
    case 'DOUBLE':
    case 'DOUBLE PRECISION':
    case 'FLOAT':
    case 'NUMERIC':
    case 'DECIMAL':
      return 'REAL';
      
    case 'BOOLEAN':
      return 'BOOLEAN';
      
    case 'DATE':
      return 'DATE';
      
    case 'DATETIME':
      return 'DATETIME';
    
    default:
      return 'TEXT';
  }
};
