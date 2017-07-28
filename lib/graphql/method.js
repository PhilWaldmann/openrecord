/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.record_methods = {}
  },


  method: function(name, fn, options){
    fn.options = options

    this.record_methods[name] = fn

    return this.callParent(name, fn)
  }
}
