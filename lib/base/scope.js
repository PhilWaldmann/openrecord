var Utils = require('../utils');

/*
 * DEFINITION
 */
exports.definition = {
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