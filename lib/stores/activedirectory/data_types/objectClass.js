exports.store = {
  mixinCallback: function(){  
    
    this.addType('objectClass', {
      toModelName: function(value){
        for(var name in this.store.models){
          if(this.store.models.hasOwnProperty(name)){
            if(this.store.models[name].definition.objectClass.join(',') === value.join(',')){
              return name;
            }
          }          
        }
        
        return '';
      }
    }, {extend: 'objectClass'});
    
  }
}


exports.definition = {  
  getName: function(){
    return this.objectClass[this.objectClass.length - 1];
  }
};
