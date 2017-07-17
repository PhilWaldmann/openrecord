
var noCastFn = function(value){
  return value
}


exports.store = {
  addType: function(name, cast, options){
    if(typeof cast === 'object'){
      if(!cast.input) cast.input = noCastFn
      if(!cast.output) cast.output = noCastFn
    }

    if(typeof name === 'string') name = name.toLowerCase()
    if(typeof cast === 'function') cast = {input: cast, output: cast, read: cast, write: cast}


    if(typeof name === 'string'){
      if(!options || !options.extend){
        if(!cast.read) throw new Error('No read cast() method given for type "' + name + '"')
        if(!cast.write) throw new Error('No write cast() method given for type "' + name + '"')
      }
    }

    if(options && options.operators){
      var ops = options.operators
      var opName

      // loop over all custom operators
      for(opName in ops){
        if(ops.hasOwnProperty(opName) && opName !== 'defaults' && opName !== 'default'){
          if(typeof ops[opName] === 'function'){
            ops[opName] = {name: opName, method: ops[opName]} // this is the default operator format.
          }else{
            if(!ops[opName].name) ops[opName].name = opName
            if(!ops[opName].method) throw new Error('No method given for operator "' + opName + '"')
          }
        }
      }

      // set the default operator for that type
      ops.default = ops.default || this.operator_default

      // set default operators (defined via store.addOperator)
      if(Array.isArray(ops.defaults)){
        for(var i = 0; i < ops.defaults.length; i++){
          opName = ops.defaults[i]
          if(this.operator_types[opName] && !ops[opName]){
            ops[opName] = this.operator_types[opName]
          }
        }
        delete ops.defaults
      }
    }

    return this.callParent(name, cast, options)
  }
}
