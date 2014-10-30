var Utils = require('../utils');
var Helper = require('./helper');


exports.store = {
  mixinCallback: function(){
    this.likePlaceholder = '%';
  }
}


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

          if(args[i] instanceof Array){
            find_one = false;
          }
        }
      }
      args = [where];
    }
    
    if(callback){
      args.push(callback);
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
      
    var conditions = Helper.sanitizeCondition(this, args);
    
    self.addInternal('conditions', conditions);
        
    if(callback){
      return self.exec(callback);
    }
    
    return self;
  }
  
};