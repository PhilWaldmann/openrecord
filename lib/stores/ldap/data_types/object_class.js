exports.store = {
  mixinCallback: function(){
    
    this.addType('object_class', {
      read: function(value){
        if(value === null) return null;
        if(!(value instanceof Array)) value = value.split(',');
        return value;        
      },
      write: function(value){
        if(value === null) return null;
        return value;
      }
    },{
      operators:{
        default: 'eq',
        defaults: ['eq', 'not']
      }
    });
    
  }
}