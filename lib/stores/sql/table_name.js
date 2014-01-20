var inflection = require('inflection');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.table_name = inflection.underscore(inflection.pluralize(this.model_name));
  }
}