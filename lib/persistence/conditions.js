var util = require('util');
var async = require('async');
var Utils = require('../utils');
var inflection = require('inflection')


/*
 * MODEL
 */
exports.model = {
  /**
   * Find one or multiple records by their primary key
   * @class Model
   * @method find
   * @param {integer} id - Find one record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   * @or
   * @param {array} ids - Find multiple record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   *
   * @return {Model}
   */
  find: function(){
    var self = this.chain();
    var args = Utils.args(arguments);
    var primary_keys = self.definition.primary_keys;

    var where = {};
    var callback;
    var find_one = true;

    if(typeof args[args.length -1] == 'function'){
      callback = args.pop();
    }

    if(args.length == primary_keys.length){
      for(var i = 0; i < primary_keys.length; i++){
        if(args[i]){
          where[primary_keys[i]] = args[i];

          if(util.isArray(args[i])){
            find_one = false;
          }
        }
      }
      args = [where];
    }

    if(callback){
      args.push(callback);
    }

    //if null was given to find!
    if(args.length === 1 && (args[0] === null || args[0] === undefined)){
      self.addInternal('exec_null', true);
      return self;
    }

    if(find_one) self.limit(1);

    return self.where.apply(self, args);
  },


  /**
   * Similar to `find`, but it will throw an error if there are no results
   * @class Model
   * @method get
   * @param {integer} id - Find one record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   * @or
   * @param {array} ids - Find multiple record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   *
   * @return {Model}
   */
  get: function(){
    var self = this.chain();
    return self.expectResult().find.apply(self, arguments);
  },



  /**
   * Set some conditions
   * @class Model
   * @method where
   * @param {object} conditions - every key-value pair will be translated into a condition
   * @param {function} callback - Optional: The `exec` callback
   * @or
   * @param {array} conditions - The first element must be a condition string with optional placeholder (?), the following params will replace this placeholders
   * @param {function} callback - Optional: The `exec` callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   *
   * @return {Model}
   */
  where: function(){
    var self = this.chain();
    var args = Utils.args(arguments);
    var callback;

    if(typeof args[args.length -1] == 'function'){
      callback = args.pop();
    }

    var conditions = Utils.sanitizeConditions(this, args);

    self.addInternal('conditions', conditions);

    if(callback){
      return self.exec(callback);
    }

    return self;
  },









  _applyCondtions: function(conditions, find_obj, callback){

    var self = this;
    var calls = [];

    for(var i = 0; i < conditions.length; i++){
      if(!conditions[i]) continue;

      (function(condition){
        calls.push(function(done){

          var interceptor = 'on' + inflection.camelize(condition.type) + 'Condition';
          self.callInterceptors(interceptor, [self, condition, find_obj], function(){
            done();
          });

        });
      })(conditions[i]);
    }


    if(calls.length === 0){
      return callback();
    }

    async.parallel(calls, function(err){
      callback(err);
    });

  }

};


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){




    this.beforeFind(function(find_obj, next){
      var conditions = this.getInternal('conditions') || [];
      this._applyCondtions(conditions, find_obj, next);
    }, -70);





    this.onHashCondition(function(chain, condition, find_obj, next){

      var attribute = condition.model.definition.attributes[condition.attribute];
      var data_type = attribute.type;
      var operator = data_type.operators[condition.operator];
      var value = condition.value;
      var method = operator.method;


      if(value && value.length === 0 && operator.nullify_empty_array !== false){
        value = null
      }


      var value_type = typeof value;
      if(util.isArray(value)) value_type = 'array';
      if(value instanceof Date) value_type = 'date';
      if(value instanceof Buffer) value_type = 'binary';
      if(value === null) value_type = 'null';
      if(value_type === 'object' && value.attribute) value_type = 'attribute';

      if(operator.on){
        if(operator.on[value_type] || (operator.on[value_type] !== false && operator.on.all !== false)){
          if(typeof operator.on[value_type] === 'function') method = operator.on[value_type];
        }else{
          this.logger.warn("Operator '" + operator.name + "' of attribute '" + condition.attribute + "' can't process value of type '" + value_type + "'");
          return;
        }
      }

      method.call(chain, condition.attribute, value, find_obj, condition);

      next();

    });


  }

};
