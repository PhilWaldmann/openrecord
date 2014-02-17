var validator = require('validator');
/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
        
    this.addType('TEXT', function(value){
      return validator.toString(value);
    });
        
    this.addType('INTEGER', function(value){
      return validator.toInt(value);
    });
    
    this.addType('REAL', function(value){
      return validator.toFloat(value);
    });
    
    this.addType('BOOLEAN', function(value){
      return validator.toBoolean(value);
    });
    
    this.addType('DATE', function(value){
      return validator.toDate(value);
    });
    
    this.addType('DATETIME', function(value){
      return validator.toDate(value);
    });
        
  }
};