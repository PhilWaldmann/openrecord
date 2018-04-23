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
  mixinCallback: function() {
    var objKeys = []
    var self = this

    this.use(function() {
      // get all current property names
      objKeys = Object.keys(this)
    }, 90)

    this.on('finished', function() {
      // an now search for new ones ==> instance methods for our new model class

      Object.keys(self).forEach(function(name) {
        if (objKeys.indexOf(name) === -1) {
          self.instanceMethods[name] = self[name]
          delete self[name]
        }
      })
    })
  }
}
