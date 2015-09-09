exports.definition = {  
  serialize: function(attribute, serializer){
    var self = this;
    serializer = serializer || JSON;
    
    this.convertOutput(attribute, function(value){      
      if(value === null) return null;
      if(typeof value === 'object') return value;
      try{
        return serializer.parse(value);
      }catch(e){
        self.store.handleException(new Error('Serialize error for attribute "' + data + '"'));
        self.store.handleException(e);
        return null;
      }      
    }, false);
    
    
    this.convertInput(attribute, function(value){
      if(value === null) return null;
      if(typeof value === 'string') return value;
      try{
        return serializer.stringify(value);
      }catch(e){
        self.store.handleException(new Error('Serialize error for attribute "' + data + '"'));
        self.store.handleException(e);
        return null;
      }      
    }, false); 
        
  }
};