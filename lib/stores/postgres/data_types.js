var validator = require('validator');
/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.field_types = {};
    
    this.addType({
      name: [String, 'string'],
      cast: function(value){
        return validator.toString(value);
      }
    });
    
    this.addType({
      name: ['integer'],
      cast: function(value){
        return validator.toInt(value);
      }
    });
    
    this.addType({
      name: [Number, 'float', 'decimal'],
      cast: function(value){
        return validator.toFloat(value);
      }
    });
    
    this.addType({
      name: [Date, 'datetime', 'date'],
      cast: function(value){
        return validator.toDate(value);
      }
    });
    
    this.addType({
      name: [Boolean, 'boolean'],
      cast: function(value){
        return validator.toBoolean(value == 't');
      }
    });
    
  }
};