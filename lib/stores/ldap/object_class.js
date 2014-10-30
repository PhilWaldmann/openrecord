var inflection = require('inflection');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    self.objectClass = inflection.underscore(self.model_name);
    
    
    //add objectClass=user filter
    self.beforeFind(function(){
      var tmp = {};
      tmp[self.objectClassAttribute] = self.getName(); //e.g. objectClass=user

      this.where(tmp);
    }, -60);
    
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

