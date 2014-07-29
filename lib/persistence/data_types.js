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
      if(!cast.read) throw new Error('No read cast() method given for type "' + name + '"');
      if(!cast.write) throw new Error('No write cast() method given for type "' + name + '"');
    }
    
    
    return this.callParent(name, cast, options);
    
  }
}