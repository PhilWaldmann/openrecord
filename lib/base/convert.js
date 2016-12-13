var Utils = require('../utils');
var Store = require('../store');


Store.addExceptionType(function MissingConvertFunction(attr){
  Error.apply(this);
  this.message = 'Missing convert function for "' + attr + '"';
});

Store.addExceptionType(function UnknownConvertAttribute(attr){
  Error.apply(this);
  this.message = 'Unknown attribute "' + attr + '"';
});



exports.definition = {

  convert: function(type, attribute, fn, force_type){
    var self = this;
    var attr = this.attributes[attribute];

    if(!fn) throw new Store.MissingConvertFunction(attribute);

    if(attr){
      //Clone the type object, because it's shared across all attributes with the same type
      attr.type = Utils.clone(attr.type);

      var original_cast = attr.type.cast[type];

      if(typeof original_cast === 'function'){
        attr.type.cast[type] = function(value){

          if(force_type !== false){
            value = original_cast(value);
          }

          if(this instanceof self.model){
            value = fn.call(this, value);

            if(force_type !== false){
              value = original_cast(value);
            }
          }
          return value;
        }
      }
    }else{
      throw new Store.UnknownConvertAttribute(attribute);
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
   * @param {boolean} force_type - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertInput: function(attribute, fn, force_type){
    return this.convert('input', attribute, fn, force_type);
  },

  /**
   * add a special convert function to manipulate the output (`toJson()`) value of an attribute
   *
   * @class Definition
   * @method convertOutput
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   * @param {boolean} force_type - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertOutput: function(attribute, fn, force_type){
    return this.convert('output', attribute, fn, force_type);
  }

}
