var util = require('util');
var async = require('async');
var Utils = require('../utils');

/*
 * MODEL
 */
exports.model = {
  /**
   * Initialize a new Record.
   * You could either use
   * ```js
   * var records = new Model();
   * ```
   * @or
   * ```js
   * var records = Model.new();
   * ```
   *
   * @class Model
   * @method new
   * @param {object} attributes - Optional: The records attributes
   *
   * @return {Record}
   */
  'new': function(data, cast_type){
    data = data || {};

    if(this.chained){

      var record = this.model.new();

      if(this.definition.temporary){
        record.definition = this.definition;
      }

      record.__chained_model = this;
      record.set(data, cast_type);

      this.add(record);

      return record;
    }

    return new this(data, cast_type);
  }
};





/*
 * CHAIN
 */
exports.chain = {

  /**
   * Loops all the Records in the Collection
   *
   * @class Collection
   * @method each
   * @param {function} callback - The method to be called for every record
   * @param {function} done - This method will be called at the end (Optional)
   *
   * @callback
   * @param {Record} record - The current record
   * @param {Number} index - The current index
   * @param {Function} next - if given, the each method will behave async. Call next() to get the next record
   * @this Collection
   *
   * @return {Collection}
   */
  each: function(callback, done){

    if(callback.length <= 2){
      for(var i = 0; i < this.length; i++){
        callback.call(this, this[i], i);
      }
      if(typeof done === 'function') done.call(this);
    }else{
      var self = this;
      var tmp = [];
      var len = this.length;

      for(var i = 0; i < this.length; i++){
        (function(record, index){

          tmp.push(function(next){
            if(len > 200){
              callback.call(self, record, index, function(err, result){
                async.setImmediate(function () {
                  next(err, result);
                });
              });
            }else{
              callback.call(self, record, index, next);
            }

          });

        })(this[i], i);
      }

      if(tmp.length === 0){
        if(typeof done === 'function') done.call(self);
        return;
      }

      async.series(tmp, function(){
        if(typeof done === 'function') done.call(self);
      });
    }

    return this;
  },

  /**
   * Adds new Records to the collection
   *
   * @class Collection
   * @method add
   * @param {array} Record - Either an object which will be transformed into a new Record, or an existing Record
   *
   * @return {Collection}
   */
  add: function(records){

    var self = this.chain();
    var relation = self.getInternal('relation');
    var parent_record = self.getInternal('relation_to');

    if(!util.isArray(records)) records = [records];

    for(var i = 0; i < records.length; i++){
      var record = records[i];
      if(record && typeof record == 'object'){

        if(self.options.polymorph){
          if(!(record instanceof record.model)) continue;
        }else{
          if(!(record instanceof self.model)) record = self.model.new(record);
        }

        self.push(record);

        if(relation && parent_record){
          self.definition.emit('relation_record_added',parent_record, relation, record);
        }
      }
    }

    return self;
  },

  /**
   * Removes a Record from the Collection
   *
   * @class Collection
   * @method remove
   * @param {integer} index - Removes the Record on the given index
   * @or
   * @param {Record} record - Removes given Record from the Collection
   *
   * @return {Collection}
   */
  remove: function(index){
    var self = this.chain();

    if(typeof index != 'number'){
      index = self.indexOf(index);
    }

    self.splice(index, 1);

    return self;
  },


  /**
   * Returns the first Record in the Collection
   *
   * @class Collection
   * @method first
   *
   * @return {Record}
   */
  first: function(){
    return this[0];
  },

  /**
   * Returns the last Record in the Collection
   *
   * @class Collection
   * @method last
   *
   * @return {Record}
   */
  last: function(){
    return this[this.length - 1];
  },


  /**
   * Creates a temporary definition object, that lives only in the current collection.
   * This is usefull if you need special converters that's only active in a certain scope.
   *
   * @class Collection
   * @method temporaryDefinition
    * @param {function} fn - Optional function with the definition scope
   *
   * @return {Definition}
   */
  __temporary_definition_attributes: ['attributes', 'interceptors', 'relations', 'validations'],

  temporaryDefinition: function(fn){
    var tmp = {temporary: true};

    if(this.definition.temporary){
      return this.definition;
    }

    for(var name in this.definition){
      var prop = this.definition[name];

      if(this.__temporary_definition_attributes.indexOf(name) !== -1){
        tmp[name] = Utils.clone(prop);
        continue;
      }

      tmp[name] = prop;
    }

    Object.defineProperty(this, 'definition', {
      enumerable: false,
      value: tmp
    });

    if(typeof fn === 'function'){
      fn.call(this.definition);
    }

    return this.definition;
  }
};
