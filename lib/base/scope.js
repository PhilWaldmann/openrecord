var Utils = require('../utils');

/*
 * DEFINITION
 */
exports.definition = {
  /**
   * Creates a custom chained Model method
   *
   * @class Definition
   * @method scope
   * @param {string} name - The name of the scope
   * @param {function} callback - The scope function
   *
   * @callback
   * @param {..custom..} You could define your own params.
   * @this Model
   *
   * @return {Definition}
   */
  scope: function(name, fn){
      
    var tmp = function(){
      var args = Utils.args(arguments);
      var self = this.chain();

      fn.apply(self, args);
      
      return self;
    }

    this.staticMethods[name] = tmp;
    
    return this;
  }
};