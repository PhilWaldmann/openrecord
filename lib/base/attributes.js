/*
 * DEFINITION
 */
exports.definition = {

  mixinCallback: function(){
    this.attributes = {};
  },

  /**
   * Add a new attribute to your Model
   * 
   * @area Definition
   * @method attribute
   * @param {string} name - The attribute name
   * @param {string} type - The attribute type (e.g. `text`, `integer`, or sql language specific. e.g. `blob`)
   * @param {object} options - Optional options
   *
   * @return {Definition}
   */ 
  attribute: function(name, type, options){    
    options = options || {};
    type = type || String;

    if(typeof type == 'string'){
      type = type.toLowerCase();
    }
    

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
    
    return this;
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
      
      return value;
    }
    return value;
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
    this.changes = {}; // e.g. {login: ['phil', 'philipp']} first value is the original, second is the changed value

    this.set(config || {});
  },
  
  
  /**
   * Set one or multiple attributes of a Record.
   * 
   * @area Record
   * @method set
   * @param {string} name - The attributes name
   * @param {VALUE} value - The attributes value
   * @param OR
   * @param {object} attributes - Multiple attribute as an object
   *
   * @return {Record}
   */ 
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
        
        
        if(this.changes[field]){
          this.changes[field][1] = value;
        }else{
          this.changes[field] = [this.attributes[field], value];
        }
        
        
        this.attributes[field] = value;
      }      
    }
    
    return this;    
  },
  
  /**
   * Get an attributes.
   * 
   * @area Record
   * @method get
   * @param {string} name - The attributes name
   *
   * @return {VALUE}
   */ 
  get: function(name){
    return this.attributes[name];
  },
  
  
  /**
   * Returns `true` if there are any changed values in that record
   * 
   * @area Record
   * @method hasChanges
   *
   * @return {boolean}
   */ 
  hasChanges: function(){
    return Object.keys(this.changes).length > 0;
  },
  
  /**
   * Returns an object with all the changes. One attribute will always include the original and current value
   * 
   * @area Record
   * @method getChanges
   *
   * @return {object}
   */ 
  getChanges: function(){
    return this.changes;
  },
  
  /**
   * Returns an object with all changed values
   * 
   * @area Record
   * @method getChangedValues
   *
   * @return {object}
   */ 
  getChangedValues: function(){
    var tmp = {};
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        tmp[name] = this.changes[name][1];
      }      
    }
    return tmp;
  },
  
  /**
   * Resets all changes to the original values
   * 
   * @area Record
   * @method resetChanges
   *
   * @return {Record}
   */ 
  resetChanges: function(){
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        this[name] = this.changes[name][0];
      }      
    }
    
    this.changes = {};
    return this;
  }
  
};