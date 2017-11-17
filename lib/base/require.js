exports.definition = {


  /**
   * require one or multiple files and/or node modules to extend your model definition.
   * The file needs to export either a function, which will be called with the definition scope
   * or an objects which will be mixed into the defintion object.
   *
   * @class Definition
   * @method require
   * @param {string} path - the filepath or package name
   *
   * @return {Definition}
   */
  require: function openrecordRequire(paths){
    this.include(paths)
    var result = this.store.utils.require(paths)

    for(var i = 0; i < result.length; i++){
      if(typeof result[i] === 'function'){
        result[i].call(this)
        continue
      }
    }

    return this
  },


  /**
   * mixin a module to extend your model definition.
   * The module needs to export either a function, which will be called with the definition scope
   * or an objects which will be mixed into the defintion object.
   *
   * @class Definition
   * @method mixin
   * @param {object,function} module - the module
   *
   * @return {Definition}
   */
  mixin: function(module){
    if(typeof module === 'function'){
      module.call(this)
    }else{
      this.include(module)
    }
    return this
  }

}
