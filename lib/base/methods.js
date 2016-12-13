var Utils = require('../utils');

exports.definition = {
  /**
   * Add custom methods to your Model`s Records
   * just define a function:
   * ```js
   *   this.function_name = function(){
   *     //this == Record
   *   };
   * ```
   * This will automatically add the new method to your Record
   *
   * @class Definition
   * @name Custom Record Methods
   *
   */
  mixinCallback: function(){
    var tmp = [];
    var self = this;

    this.use(function(){
      //get all current property names
      Utils.loopProperties(this, function(name, value){
        tmp.push(name);
      });
    }, 90);


    this.on('finished', function(){
      //an now search for new ones == instance methods for our new model class

      Utils.loopProperties(self, function(name, value){
        if(tmp.indexOf(name) == -1){
          self.instanceMethods[name] = value;
          delete self[name];
        }
      });
    })
  }
}
