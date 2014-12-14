exports.store = {
  mixinCallback: function(){
    
    this.addType('object_class', {
      read: function(value){
        if(value === null) return null;
        return value.toString();        
      },
      write: function(value){
        if(value === null) return null;
        return value;
      }
    },{
      operators:{
        default: 'eq',
        defaults: ['eq']
      }
    });
    
  }
}