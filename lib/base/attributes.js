var util = require('util');
var Store = require('../store');
var Utils = require('../utils');

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
   * @class Definition
   * @method attribute
   * @param {string} name - The attribute name
   * @param {string} type - The attribute type (e.g. `text`, `integer`, or sql language specific. e.g. `blob`)
   * @param {object} options - Optional options
   *
   * @options
   * @param {boolean} writable - make it writeable (default: true)
   * @param {boolean} readable - make it readable (default: true)
   * @param {any} default - Default value
   * @param {boolean} emit_events - emit change events `name_changed` (default: false)
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
      return this.store.handleException(new Store.UnknownAttributeTypeError(type));
    }

    Utils.addDefaults(options, field_type.defaults);


    options.type = field_type;
    options.writable = options.writable === undefined ? true : (options.writable ? true : false);
    options.readable = options.readable === undefined ? true : (options.readable ? true : false);
    options.track_object_changes = options.track_object_changes === undefined ? false : (options.track_object_changes ? true : false);

    this.attributes[name] = options;

    this.setter(name, options.setter || function(value){
      this.set(name, value);
    });

    if(options.readable){
      this.getter(name, function(){
        return this.get(name);
      });
    }

    return this;
  },

  cast: function(attribute, value, cast_name){
    var cast_name = cast_name || 'input';
    var attr = this.attributes[attribute];
    var cast = attr ? attr.type.cast[cast_name] : null;

    if(attr && cast){
      if(util.isArray(value)){
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


  /**
   * Add a custom getter to your record
   *
   * @class Definition
   * @method getter
   * @param {string} name - The getter name
   * @param {function} fn - The method to call
   *
   * @return {Definition}
   */
  getter: function(name, fn){

    this.instanceMethods.__defineGetter__(name, fn);

    return this;
  },

  /**
   * Add a custom setter to your record
   *
   * @class Definition
   * @method setter
   * @param {string} name - The setter name
   * @param {function} fn - The method to call
   *
   * @return {Definition}
   */
  setter: function(name, fn){

    this.instanceMethods.__defineSetter__(name, fn);

    return this;
  }
};





/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config, cast_type){

    this.relations = {};
    this.attributes = {};
    this.changes = {}; // e.g. {login: ['phil', 'philipp']} first value is the original, second is the changed value
    this.object_changes = {};

    if(config){
      this.set(config || {}, cast_type);
    }
  },


  /**
   * Set one or multiple attributes of a Record.
   *
   * @class Record
   * @method set
   * @param {string} name - The attributes name
   * @param {VALUE} value - The attributes value
   * @or
   * @param {object} attributes - Multiple attribute as an object
   * @param {string} cast_type - Optional cast_type name (Default: `input`)
   *
   * @return {Record}
   */
  set: function(name, value){
    var values = name;
    var cast_type = value;
    var single_assign = false;
    if(typeof name == 'string'){
      values = {};
      values[name] = value;
      cast_type = 'input'
      single_assign = true;
    }

    for(var field in this.definition.attributes){
      if(this.definition.attributes.hasOwnProperty(field)){

        if(single_assign && values[field] === undefined){
          continue;
        }


        var definition = this.definition.attributes[field];
        var value = values[field];


        if(!single_assign && value && typeof definition.setter === 'function'){
          definition.setter.call(this, value);
          continue;
        }

        if(value === undefined && this.attributes[field] === undefined && definition.default !== undefined){
          value = Utils.clone(definition.default);
        }

        if(value === undefined && this.attributes[field] !== undefined){
          value = this.attributes[field];
        }

        if(value === undefined){
          value = null;
        }


        //typecasted value
        var cast_type = cast_type || 'input';

        if(!definition.type.cast[cast_type]){
          cast_type = 'input';
        }

        value = value !== null ? definition.type.cast[cast_type].call(this, value) : null;

        if(this.attributes[field] !== value){

          if(value && typeof value === 'object'){
            //automatically set object tracking to true if the value is still an object after the casting
            definition.track_object_changes = true;
          }

          if(definition.writable && !(value === null && this.attributes[field] === undefined)){
            var before_value = this[field]
            var after_value = value;

            if(this.changes[field]){
              this.changes[field][1] = after_value;
            }else{
              this.changes[field] = [before_value, after_value];
            }
          }

          if(definition.track_object_changes && (this.object_changes[field] === undefined || cast_type !== 'input')){
            //initial object hash
            this.object_changes[field] = [this.objectHash(value), JSON.stringify(value)];
          }

          this.attributes[field] = value;

          if(definition.emit_events && before_value != value){
            //emit old_value, new_value
            this.definition.emit(field + '_changed', this, before_value,  value);
          }

        }
      }
    }

    return this;
  },

  /**
   * Get an attributes.
   *
   * @class Record
   * @method get
   * @param {string} name - The attributes name
   *
   * @return {VALUE}
   */
  get: function(name){
    var attr = this.definition.attributes[name];

    if(attr){
      //set undefined values to null
      if(this.attributes[name] === undefined){
        this.attributes[name] = null;
      }
      return attr.type.cast.output.call(this, this.attributes[name]);
    }

    return null;
  },


  /**
   * Returns `true` if there are any changed values in that record
   *
   * @class Record
   * @method hasChanges
   *
   * @return {boolean}
   */
  hasChanges: function(){
    this.checkObjectChanges();
    return Object.keys(this.getChanges()).length > 0;
  },

  /**
   * Returns `true` if the given attributes has changed
   *
   * @class Record
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
   * @class Record
   * @method getChanges
   *
   * @return {object}
   */
  getChanges: function(){
    this.checkObjectChanges();
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
   * @class Record
   * @method getChangedValues
   *
   * @return {object}
   */
  getChangedValues: function(){
    this.checkObjectChanges();
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
   * @class Record
   * @method resetChanges
   *
   * @return {Record}
   */
  resetChanges: function(){
    //TODO: reset object changes
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        this[name] = this.changes[name][0];
      }
    }

    this.changes = {};
    return this;
  },



  checkObjectChanges: function(){
    for(var field in this.object_changes){
      if(this.object_changes.hasOwnProperty(field)){
        if(this.attributes[field]){
          var hash = this.objectHash(this.attributes[field]);
          if(hash != this.object_changes[field][0] && !this.changes[field]){
            this.changes[field] = [JSON.parse(this.object_changes[field][1]), this.attributes[field]];
          }
        }
      }
    }
  },


  objectHash: function(obj){
    if(!obj) return null;
    return JSON.stringify(obj)
    .split('')
    .reduce(function(a,b){
      a=((a<<5)-a)+b.charCodeAt(0);
      return a&a
    },0);
  }

};
