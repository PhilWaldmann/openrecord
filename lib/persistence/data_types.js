var util = require('util');


var no_cast_fn = function(value){
  return value;
};


exports.store = {
  addType: function(name, cast, options){

    if(typeof cast === 'object'){
      if(!cast.input) cast.input   = no_cast_fn;
      if(!cast.output) cast.output = no_cast_fn;
    }

    if(typeof name === 'string') name = name.toLowerCase();
    if(typeof cast === 'function') cast = {input: cast, output: cast, read: cast, write: cast};


    if(typeof name === 'string'){
      if(!options || !options.extend){
        if(!cast.read) throw new Error('No read cast() method given for type "' + name + '"');
        if(!cast.write) throw new Error('No write cast() method given for type "' + name + '"');
      }
    }

    if(options && options.operators){
      var ops = options.operators;

      //loop over all custom operators
      for(var op_name in ops){
        if(ops.hasOwnProperty(op_name) && op_name != 'defaults' && op_name != 'default'){
          if(typeof ops[op_name] === 'function'){
            ops[op_name] = {name:op_name, method: ops[op_name]}; //this is the default operator format.
          }else{
            if(!ops[op_name].name) ops[op_name].name = op_name;
            if(!ops[op_name].method) throw new Error('No method given for operator "' + op_name + '"');
          }
        }
      }

      //set the default operator for that type
      ops.default = ops.default || this.operator_default;

      //set default operators (defined via store.addOperator)
      if(util.isArray(ops.defaults)){
        for(var i = 0; i < ops.defaults.length; i++){
          var op_name = ops.defaults[i];
          if(this.operator_types[op_name] && !ops[op_name]){
            ops[op_name] = this.operator_types[op_name];
          }
        }
        delete ops.defaults;
      }
    }

    return this.callParent(name, cast, options);

  }
}
