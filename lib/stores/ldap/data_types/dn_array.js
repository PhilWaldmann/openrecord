exports.store = {
  mixinCallback: function(){
    
    this.addType('dn_array', {
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