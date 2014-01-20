var validator = require('validator');
/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.field_types = {};
    
    this.addType({
      name: String,
      cast: function(value){
        return validator.toString(value);
      }
    });
    
    this.addType({
      name: Number,
      cast: function(value){
        return validator.toFloat(value);
      }
    });
    
    this.addType({
      name: Date,
      cast: function(value){
        return validator.toDate(value);
      }
    });
    
    this.addType({
      name: Boolean,
      cast: function(value){
        return validator.toBoolean(value);
      }
    });
    
  },
  
  addType: function(config){
    
    if(!config.name) throw new Error('No name given');
    if(!config.cast || typeof config.cast != 'function') throw new Error('No valid cast() method given');
    
    if(!(config.name instanceof Array)) config.name = [config.name];
    
    for(var i in config.name){
      this.field_types[config.name[i]] = config;
    }
    
  },
  
  
  getType: function(name){
    return this.field_types[name];
  }
};