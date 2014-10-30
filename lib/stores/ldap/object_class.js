var inflection = require('inflection');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.objectClass = this.model_name;
  },
  
  getName: function(){
    return this.objectClass;
  }
};


/*
 * STORE
 */
exports.store = {
  getByObjectClass: function(objectClass){
    for(var i in this.models){
      if(this.models[i].definition.objectClass == objectClass){
        return this.models[i];
      }
    }
  }
}

