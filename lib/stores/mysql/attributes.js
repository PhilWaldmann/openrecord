/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){

      var self = this;

      this.store.connection.raw("DESCRIBE " + this.table_name).asCallback(function(err, response){
        if(err){
          next();
          return self.store.handleException(err);
        }

        var result = response[0];

        for(var i in result){
          self.attribute(result[i].Field, simplified_type(result[i].Type), {
            persistent: true,
            primary: result[i].Key == 'PRI',
            notnull: result[i].Null != 'YES',
            default: result[i].Default,
            writable: !(result[i].Key == 'PRI' && result[i].Extra == 'auto_increment') //set to false if primary and integer
          });

          if(result[i].Null != 'YES' && result[i].Key != 'PRI'){
            self.validatesPresenceOf(result[i].Field);
          }
        }

        next();
      });

    }, 80);

  }
};


function simplified_type(type){
  if(type.toLowerCase() == 'tinyint(1)') type = 'boolean';
  type = type.replace(/\(.+\)/, '').toUpperCase();

  switch(type){
    case 'BIGINT UNSIGNED':
    case 'INT UNSIGNED':
    case 'TINYINT':
    case 'INT':
      return 'integer';


    case 'FLOAT':
      return 'float';

    case 'BOOLEAN':
      return 'boolean';

    case 'DATE':
      return 'date';

    case 'TIME':
      return 'time';

    case 'DATETIME':
      return 'datetime';

    case 'BLOB':
      return 'binary';

    default:
      return 'string';
  }
};
