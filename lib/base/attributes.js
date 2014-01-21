/*
 * DEFINITION
 */
exports.definition = {

  mixinCallback: function(){
    this.attributes = {};
  },

  attribute: function(name, type, options){    
    options = options || {};
    type = type || String;

    var field_type = this.store.getType(type);
    if(!field_type){
      throw new Error('Unknown type ' + type);
    }
    
    options.type = field_type;
    
    this.attributes[name] = options;
    
    this.setter(name, function(value){
      this.set(name, value);
    });
    
    this.getter(name, function(){
      return this.attributes[name];
    });
    
  },
  
  cast: function(attribute, value){
    var attr = this.attributes[attribute];
    if(attr){
      if(value instanceof Array){
        for(var i = 0; i < value.length; i++){
          value[i] = attr.type.cast(value[i]);
        }
      }else{
        value = attr.type.cast(value);
      }
      
      return value
    }
    return null;
  },
  
  getter: function(name, fn){
    
    this.instanceMethods.__defineGetter__(name, fn);
        
    return this;
  },
  
  setter: function(name, fn){
    
    this.instanceMethods.__defineSetter__(name, fn);
    
    return this;
  }
};





/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    this.attributes = {};

    this.set(config || {});
  },
  
  
  set: function(name, value){
    var values = name;
    if(typeof name == 'string'){
      values = {};
      values[name] = value;
    }
    
    for(var field in this.definition.attributes){
      var definition = this.definition.attributes[field];
      var value = values[field] || this.attributes[field] || definition.default;
      
      if(!value) continue;
      
      //typecasted value
      value = definition.type.cast(value);
      
      if(this.attributes[field] != value){
        
        //emit old_value, new_value
        this.definition.emit(this, field + '_changed', this.attributes[field],  value);
                  
        this.attributes[field] = value;
      }      
    }    
  },
  
  
  get: function(name){
    return this.attributes[name];
  }
  
};