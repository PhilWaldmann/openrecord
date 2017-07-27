const Utils = require('../utils')
const Store = require('../store')


Store.addExceptionType(function MissingConvertFunction(attr){
  Error.apply(this)
  this.message = 'Missing convert function for "' + attr + '"'
})

Store.addExceptionType(function UnknownConvertAttribute(attr){
  Error.apply(this)
  this.message = 'Unknown attribute "' + attr + '"'
})



exports.definition = {

  convert: function(type, attribute, fn, forceType){
    var self = this
    var attr = this.attributes[attribute]

    if(!fn) throw new Store.MissingConvertFunction(attribute)

    if(attr){
      // Clone the type object, because it's shared across all attributes with the same type
      attr.type = Utils.clone(attr.type)

      var originalCast = attr.type.cast[type]

      if(typeof originalCast === 'function'){
        attr.type.cast[type] = function(value){
          if(forceType !== false){
            value = originalCast(value)
          }

          if(this instanceof self.model){
            value = fn.call(this, value)
            if(forceType !== false){
              value = originalCast(value)
            }
          }

          return value
        }
      }
    }else{
      throw new Store.UnknownConvertAttribute(attribute)
    }

    return this
  },


  /**
   * add a special convert function to manipulate the input (e.g. via `set()`) value of an attribute
   *
   * @class Definition
   * @method convertInput
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   * @param {boolean} forceType - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertInput: function(attribute, fn, forceType){
    return this.convert('input', attribute, fn, forceType)
  },

  /**
   * add a special convert function to manipulate the output (`toJson()`) value of an attribute
   *
   * @class Definition
   * @method convertOutput
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   * @param {boolean} forceType - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertOutput: function(attribute, fn, forceType){
    return this.convert('output', attribute, fn, forceType)
  }

}
