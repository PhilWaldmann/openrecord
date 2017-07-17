var Utils = require('../utils')

exports.definition = {


  /**
   * require one or multiple files and/or node modules to extend your model definition.
   * The file needs to export either a function, which will be called with the definition scope
   * or an objects which will be mixed into the defintion object.
   *
   * @class Definition
   * @method mixin
   * @param {string} path - the filepath or package name
   *
   * @return {Definition}
   */
  require: function openrecordRequire(paths){
    var result = Utils.require(paths)

    for(var i = 0; i < result.length; i++){
      if(typeof result[i] === 'function'){
        result[i].call(this)
        continue
      }

      if(typeof result[i] === 'object'){
        Utils.mixin(this, result[i])
      }
    }

    return this
  }

}
