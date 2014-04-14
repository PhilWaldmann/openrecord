var validator = require('validator');

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.field_types = {};
    
    this.addType(String, function(value){
      return validator.toString(value);
    });
    
    this.addType(Number, function(value){
      return validator.toFloat(value);
    });
    
    this.addType(Date, function(value){
      return validator.toDate(value);
    });
    
    this.addType(Boolean, function(value){
      return validator.toBoolean(value);
    });
    
  },
  
  addType: function(name, cast, options){
    options = options || {};    
    
    if(!name) throw new Error('No name given');
    if(!cast) throw new Error('No valid cast() method given');
    
    if(typeof name == 'string') name = name.toLowerCase();
    if(typeof cast == 'function') cast = {input: cast, output: cast};
    
    if(!cast.input) throw new Error('No intput cast() method given');
    if(!cast.output) throw new Error('No output cast() method given');
    
    
    options.name = name;
    options.cast = cast;
    
    this.field_types[name] = options;
    
  },
  
  
  getType: function(name){
    if(typeof name == 'string') name = name.toLowerCase();
    return this.field_types[name];
  }
};