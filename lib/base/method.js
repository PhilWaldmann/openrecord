/*
 * DEFINITION
 */
exports.definition = {
  /**
   * Adds a new method to the record
   *
   * @class Definition
   * @method method
   * @param {string} name - The name of the method
   * @param {function} callback - The function
   *
   * @return {Definition}
   */
  method: function(name, fn) {
    if (this.attributes[name])
      throw new Error(
        'A method with the same name as a attribure is not allowed'
      )
    this.instanceMethods[name] = fn

    return this
  },

  /**
   * Adds a new method to the class
   *
   * @class Definition
   * @method method
   * @param {string} name - The name of the method
   * @param {function} callback - The function
   *
   * @return {Definition}
   */
  staticMethod: function(name, fn) {
    this.staticMethods[name] = fn

    return this
  }
}
