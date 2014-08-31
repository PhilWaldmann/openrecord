exports.definition = {
  /**
   * add a special convert function to manipulate the read (`exec()`) value of an attribute
   * 
   * @class Definition
   * @method convertRead
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
  convertRead: function(attribute, fn, force_type){
    return this.convert('read', attribute, fn, force_type);
  },
  
  /**
   * add a special convert function to manipulate the write (`save()`) value of an attribute
   * 
   * @class Definition
   * @method convertWrite
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
  convertWrite: function(attribute, fn, force_type){
    return this.convert('write', attribute, fn, force_type);
  }
  
}