var Utils = require('../utils');

exports.definition = {
  
  convert: function(type, attribute, fn){
    var self = this;
    var attr = this.attributes[attribute];
    
    if(attr){
      //Clone the type object, because it's shared across all attributes with the same type
      attr.type = Utils.clone(attr.type);
      
      var original_cast = attr.type.cast[type];
      
      if(typeof original_cast === 'function'){
        attr.type.cast[type] = function convertInput(value){
          value = original_cast(value);
          if(this instanceof self.model){
            value = fn.call(this, value);
            value = original_cast(value);
          }
          return value;
        }
      }
    }
    
    return this;
  },
  
  
  /**
   * add a special convert function to manipulate the input (e.g. via `set()`) value of an attribute
   * 
   * @class Definition
   * @method convertInput
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   *
   * @options
   * @param {variable} value - the value to convert
   *
   * @return {Definition}
   */ 
  convertInput: function(attribute, fn){
    return this.convert('input', attribute, fn);
  },
  
  /**
   * add a special convert function to manipulate the output (`toJson()`) value of an attribute
   * 
   * @class Definition
   * @method convertOutput
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   *
   * @options
   * @param {variable} value - the value to convert
   *
   * @return {Definition}
   */ 
  convertOutput: function(attribute, fn){
    return this.convert('output', attribute, fn);
  }
  
}