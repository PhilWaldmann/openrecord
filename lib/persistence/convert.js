exports.definition = {
  /**
   * add a special convert function to manipulate the read (`exec()`) value of an attribute
   * 
   * @class Definition
   * @method convertRead
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   *
   * @options
   * @param {variable} value - the value to convert
   *
   * @return {Definition}
   */ 
  convertRead: function(attribute, fn){
    return this.convert('read', attribute, fn);
  },
  
  /**
   * add a special convert function to manipulate the write (`save()`) value of an attribute
   * 
   * @class Definition
   * @method convertWrite
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   *
   * @options
   * @param {variable} value - the value to convert
   *
   * @return {Definition}
   */ 
  convertWrite: function(attribute, fn){
    return this.convert('write', attribute, fn);
  }
  
}