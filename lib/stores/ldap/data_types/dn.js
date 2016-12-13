var Utils = require('../../../utils');

exports.store = {
  mixinCallback: function(){

    this.addType('dn', {
      read: function(value){
        if(value === null) return null;
        return Utils.normalizeDn(value);
      },
      input: function(value){
        if(value === null) return null;
        return Utils.normalizeDn(value, false); //of change the dn on our side, we wont lower case them => writes
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
