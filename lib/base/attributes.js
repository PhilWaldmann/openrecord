var Store = require('../store');

Store.addExceptionType(function UnknownAttributeTypeError(type){
  Error.apply(this);
  this.message = 'Unknown attribute type "' + type + '"';
});



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
   * @section Definition
   * @method attribute
   * @param {string} name - The attribute name
   * @param {string} type - The attribute type (e.g. `text`, `integer`, or sql language specific. e.g. `blob`)
   * @param {object} options - Optional options
   *
   * @options
   * @param {boolean} writable - make it writeable (default: true)
   * @param {boolean} readable - make it readable (default: true)
   * @param {boolean} default - Default value
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
      throw new Store.UnknownAttributeTypeError(type);
    }
    
    options.type = field_type;
    options.writable = options.writable === undefined ? true : (options.writable ? true : false);
    options.readable = options.readable === undefined ? true : (options.readable ? true : false);
    
        
    this.attributes[name] = options;
    
    this.setter(name, function(value){
      this.set(name, value);
    });
    
    if(options.readable){
      this.getter(name, function(){
        return this.attributes[name];
      });
    }
    
    return this;
  },
  
  cast: function(attribute, value, cast_name){
    var cast_name = cast_name || 'input';
    var attr = this.attributes[attribute];
    var cast = attr ? attr.type.cast[cast_name] : null;

    if(attr && cast){
      if(value instanceof Array){
        for(var i = 0; i < value.length; i++){
          value[i] = this.cast(attribute, value[i]);
        }
      }else{
        value = cast(value);
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
   * @section Record
   * @method set
   * @param {string} name - The attributes name
   * @param {VALUE} value - The attributes value
   * or
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
      if(this.definition.attributes.hasOwnProperty(field)){
        var definition = this.definition.attributes[field];
        var value = values[field];

        if(value === undefined && this.attributes[field] === undefined){
          value = definition.default;
        }
        
        if(value === undefined && this.attributes[field] !== undefined){
          value = this.attributes[field];
        }

        if(value === undefined){
          value = null;
        }

        
        //typecasted value
        value = value !== null ? definition.type.cast.input(value) : null;

        if(this.attributes[field] !== value){
        
          //emit old_value, new_value
          this.definition.emit(field + '_changed', this, this.attributes[field],  value);        
        
          if(definition.writable && !(value === null && this.attributes[field] === undefined)){
            if(this.changes[field]){
              this.changes[field][1] = value;
            }else{
              this.changes[field] = [this.attributes[field], value];
            }
          }
          
          this.attributes[field] = value;
        }      
      }
    }
    
    return this;    
  },
  
  /**
   * Get an attributes.
   * 
   * @section Record
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
   * @section Record
   * @method hasChanges
   *
   * @return {boolean}
   */ 
  hasChanges: function(){
    return Object.keys(this.getChanges()).length > 0;
  },
  
  /**
   * Returns `true` if the given attributes has changed
   * 
   * @section Record
   * @method hasChanged
   * @param {string} name - The attributes name
   *
   * @return {boolean}
   */ 
  hasChanged: function(name){
    return Object.keys(this.getChanges()).indexOf(name) !== -1;
  },
  
  /**
   * Returns an object with all the changes. One attribute will always include the original and current value
   * 
   * @section Record
   * @method getChanges
   *
   * @return {object}
   */ 
  getChanges: function(){
    var tmp = {};
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        if(!this.allowed_attributes || (this.allowed_attributes && this.allowed_attributes.indexOf(name) !== -1))
        tmp[name] = this.changes[name];
      }      
    }
    return tmp;
  },
  
  /**
   * Returns an object with all changed values
   * 
   * @section Record
   * @method getChangedValues
   *
   * @return {object}
   */ 
  getChangedValues: function(){
    var tmp = {};
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        if(!this.allowed_attributes || (this.allowed_attributes && this.allowed_attributes.indexOf(name) !== -1))
        tmp[name] = this.changes[name][1];
      }      
    }
    return tmp;
  },
  
  /**
   * Resets all changes to the original values
   * 
   * @section Record
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