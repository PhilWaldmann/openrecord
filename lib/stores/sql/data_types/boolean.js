var validator = require('validator');

exports.store = {

  mixinCallback: function(){
        
    this.addType('boolean', function(value){
      if(value === null) return null;
      return validator.toBoolean(value);
    },{
      migration:'boolean',
      operators:{
        defaults: ['eq', 'not']
      }
    });
        
  }
};
