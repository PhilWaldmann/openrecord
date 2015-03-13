var parseDN = require('ldapjs').parseDN;

exports.store = {
  mixinCallback: function(){
    
    this.addType('dn_array', {
      read: function(values){
        if(values == null) return [];
        if(!(values instanceof Array)) values = [values];
        
        for(var i = 0; i < values.length; i++){
          if(values[i]){
            values[i] = parseDN(values[i]).toString().replace(/\, /g, ',').toLowerCase();
          }else{
            values.splice(i, 1);
            i--;
          }
        }
        return values;        
      },
      write: function(values){
        if(!values) return [];
        if(!(values instanceof Array)) values = [values];
        if(values.length === 0) return null;
        
        return values;
      },
      output: function(values){
        if(values === null) return [];
        return values;
      }
    },{
      operators:{
        default: 'eq',
        defaults: ['eq']
      }
    });
    
  }
}