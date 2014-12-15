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

      if(this.getInternal('without_object_class') !== true){
         this.where(tmp);
      }
    }, -60);
    
  },
  
  getName: function(){
    if(this.objectClass instanceof Array) return this.objectClass[this.objectClass.length - 1];
    return this.objectClass;
  }
};


/*
 * STORE
 */
exports.store = {
  getByObjectClass: function(objectClass){
    for(var i in this.models){
      if(this.models[i].definition.objectClass.toString() === objectClass.toString()){
        return this.models[i];
      }
    }
  }
}

