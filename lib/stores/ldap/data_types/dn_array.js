var util = require('util');
var Utils = require('../../../utils');

exports.store = {
  mixinCallback: function(){

    this.addType('dn_array', {
      read: function(values){
        if(values == null) return [];
        if(!util.isArray(values)) values = [values];
        return Utils.normalizeDn(values);
      },
      write: function(values){
        if(!values) return [];
        if(!util.isArray(values)) values = [values];
        return values;
      },
      input: function(values){
        if(values == null) return [];
        if(!util.isArray(values)) values = [values];
        return Utils.normalizeDn(values);
      },
      output: function(values){
        if(values === null)return [];
        return values;
      }
    },{
      defaults:{
        default: [],
        track_object_changes: true
      },
      operators:{
        default: 'eq',
        defaults: ['eq']
      }
    });

  }
}
