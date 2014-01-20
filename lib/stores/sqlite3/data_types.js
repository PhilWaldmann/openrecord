var validator = require('validator');
/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.field_types = {};
    
    this.addType({
      name: [String, 'TEXT', 'BLOB'],
      cast: function(value){
        return validator.toString(value);
      }
    });
    
    this.addType({
      name: ['INTEGER'],
      cast: function(value){
        return validator.toInt(value);
      }
    });
    
    this.addType({
      name: [Number, 'REAL', 'NUMERIC'],
      cast: function(value){
        return validator.toFloat(value);
      }
    });
        
  }
};