var validator = require('validator');
/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
        
    this.addType('TEXT', function(value){
      return validator.toString(value);
    }, {migration:['string', 'text']});
            
    this.addType('INTEGER', function(value){
      return validator.toInt(value);
    }, {migration:'integer'});
    
    this.addType('REAL', function(value){
      return validator.toFloat(value);
    }, {migration:'float'});
    
    this.addType('BOOLEAN', function(value){
      return validator.toBoolean(value);
    }, {migration:'boolean'});
    
    this.addType('DATE', function(value){
      return validator.toDate(value);
    }, {migration:'date'});
    
    this.addType('DATETIME', function(value){
      return validator.toDate(value);
    }, {migration:'datetime'});
    
    this.addType('TIME', function(value){
      return validator.toDate(value);
    }, {migration:'time'});
    
    this.addType('BLOB', function(value){
      return validator.toDate(value);
    }, {migration:'binary'});
        
  }
};