var Helper = require('./helper');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    this.beforeFind(function(query){
      var conditions = this.getInternal('conditions') || [];
      var table_map = this.getInternal('table_map');

      Helper.applyConditions(conditions, table_map, query);
      
      return true;
    }, -70);
    
  }  
  
};