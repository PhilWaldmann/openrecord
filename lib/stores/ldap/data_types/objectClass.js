exports.store = {
  mixinCallback: function(){
    
    this.addType('objectClass', {
      read: function(value){
        if(value === null) return null;
        return value.toString();        
      },
      write: function(value){
        if(value === null) return null;
        return value;
      }
    });
    
  }
}