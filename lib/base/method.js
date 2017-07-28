/*
 * DEFINITION
 */
exports.definition = {

  /**
   * Adds a new method to the record
   *
   * @class Definition
   * @method method
   * @param {string} name - The name of the scope
   * @param {function} callback - The scope function
   *
   * @return {Definition}
   */
  method: function(name, fn){
    this.instanceMethods[name] = fn

    return this
  }
}
