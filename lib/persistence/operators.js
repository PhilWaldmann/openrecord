/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.operatorTypes = {}
    this.operatorDefault = null
  },



  // register global operators - could be overwritten per data type
  addOperator: function(name, fn, options){
    /* istanbul ignore next */
    if(!name || typeof name !== 'string') throw new Error('No name given')
    
    if(typeof fn === 'object'){
      options = fn
      fn = null
    }

    options = options || {}
    name = name.toLowerCase()

    if(typeof fn === 'function') options.defaultMethod = fn

    if(options.on && options.on.all === undefined) options.on.all = true

    this.operatorTypes[name] = options
    if(options.default) this.operatorDefault = name
  },


  /* istanbul ignore next */
  getOperator: function(name){
    if(typeof name === 'string') name = name.toLowerCase()
    return this.operatorTypes[name] || this.operatorTypes[this.operatorDefault]
  }
}
