var inflection = require('inflection');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.resource = inflection.underscore(inflection.pluralize(this.model_name));
  }
};


/*
 * STORE
 */
exports.store = {
  getByResource: function(resource){
    for(var i in this.models){
      if(this.models[i].definition.resource == resource){
        return this.models[i];
      }
    }
  }
}

