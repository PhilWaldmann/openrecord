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
          self.attribute(result[i].name, result[i].type, {
            primary: result[i].pk != 0,
            notnull: result[i].notnull == 1,
            default: result[i].dflt_value            
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