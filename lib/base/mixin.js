exports.definition = {
  /**
   * mixin a module to extend your model definition.
   * The module needs to export either a function, which will be called with the definition scope
   * or an objects which will be mixed into the defintion object.
   *
   * @class Definition
   * @method mixin
   * @param {(object|function)} module - the module
   *
   * @return {Definition}
   */
  mixin: function(module) {
    if (typeof module === 'function') {
      module.call(this)
    } else {
      this.include(module)
    }
    return this
  }
}
