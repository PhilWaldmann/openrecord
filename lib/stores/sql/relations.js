var inflection = require('inflection');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
      
    this.on('relation_added', function(options){
      
      if(this.primary_keys.length > 1) throw new Error('Relations with 2 primary keys are not implemented!');
      
      var primary_key = this.primary_keys[0];
      
      if(options.type == 'has_many'){
        options.foreign_key = options.foreign_key || inflection.singularize(self.table_name) + '_' + primary_key;
        options.primary_key = options.primary_key || primary_key;
      }
      
      if(options.type == 'belongs_to'){
        options.primary_key = options.primary_key || inflection.singularize(options.model.definition.table_name) + '_' + primary_key;
        options.foreign_key = options.foreign_key || primary_key;
      }
      
    });
  }
};