var util = require('util');

exports.store = {
  mixinCallback: function(){

    this.addType('object_class', {
      read: function(value){
        if(value === null) return null;
        if(!util.isArray(value)) value = value.split(',');
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
