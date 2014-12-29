var parseDN = require('ldapjs').parseDN;

exports.store = {
  mixinCallback: function(){
    
    this.addType('dn', {
      read: function(value){
        if(value === null) return null;
        return parseDN(value.toString()).toString().replace(/\, /g, ',').toLowerCase();    
      },
      input: function(value){
        if(value === null) return null;
        return parseDN(value.toString()).toString().replace(/\, /g, ',').toLowerCase();    
      },
      write: function(values){
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