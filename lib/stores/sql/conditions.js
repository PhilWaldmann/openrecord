var Utils = require('../../utils');
var Helper = require('./helper');


/*
 * MODEL
 */
exports.model = {
  /**
   * Find one or multiple records by their primary key
   * @section Model/Find
   * @method find
   * @param {integer} id - Find one record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   * or
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
    var args = Utils.args(arguments);
    var primary_keys = this.definition.primary_keys;
        
    var where = {};
    var callback;
    var find_one = true;
    
    if(typeof args[args.length -1] == 'function'){
      callback = args.pop();      
    }
    
    if(args.length == primary_keys.length){
      for(var i = 0; i < primary_keys.length; i++){
        where[primary_keys[i]] = args[i];
        
        if(args[i] instanceof Array){
          find_one = false;
        }
      }
      args = [where];
    }
    
    if(callback){
      args.push(callback);
    }
    
    var self = this.where.apply(this, args);    
    if(find_one) self.limit(1);
    
    return self;
  },
  
  
  /**
   * Similar to `find`, but it will throw an error if there are no results
   * @section Model/Find
   * @method get
   * @param {integer} id - Find one record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   * or
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
    return this.expectResult().find.apply(this, arguments);
  },
  
  
  
  /**
   * Set some conditions
   * @section Model/Find
   * @method where
   * @param {object} conditions - every key-value pair will be translated into a condition
   * @param {function} callback - Optional: The `exec` callback
   * or
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
    
    for(var i = 0; i < conditions.length; i++){
      self.addInternal('conditions', conditions[i]);
    }
        
    if(callback){
      self.exec(callback);
    }
    
    return self;
  }
  
};







/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(query){
      var conditions = this.getInternal('conditions') || [];
      var table_map = this.getInternal('table_map');

      for(var i in conditions){
        if(conditions[i].type == 'raw'){
          query.whereRaw(conditions[i].query, conditions[i].args);
        }else{
          var name = conditions[i].field;
          var table = conditions[i].table;
          var value = conditions[i].value;
          var operator = conditions[i].operator;
          var name_tree = conditions[i].name_tree;
          
          if(table_map && name_tree.length > 0){
            if(table_map[name_tree.join('.')]) table = table_map[name_tree.join('.')];
          }
          
          
          if(value instanceof Array){
            if(operator == '!='){
              query.whereNotIn(table + '.' + name, value);
            }else{
              if(operator == '='){
                query.whereIn(table + '.' + name, value);
              }else{
                query.where(function(){
                  for(var i in value){
                    this.orWhere(table + '.' + name, operator, value[i]);
                  }                  
                });
              }
            }              
          }else{
            query.where(table + '.' + name, operator, value);
          }
        }
      }
      
      return true;
    }, -70);
    
  }  
  
};