var Utils = require('../../utils');

/*
 * DEFINITION
 */
exports.definition = {
  /**
   * This validator checks the uniqness of the given field`s value before save.
   * @area Definition/Validations
   * @method validatesUniquenessOf
   * @param {array} fields - The fields to validate
   * @param OR
   * @param {string} fields - The field to validate
   * @param {object} options - Optional: Options hash
   *
   * @options
   * @param {string} scope - Set a scope column
   *
   * @return {Definition}
   */
  validatesUniquenessOf: function(){
    var args = Utils.args(arguments);
    if(args.length > 1 && typeof args[1] == 'string'){
      return this.validateFieldsHelper(args, this.validatesUniquenessOf);
    }
    
    var field = args[0];
    var options = args[1] || {};
    var self = this;
    
    return this.validates(field, function(next){
      var records = this;
      var primary_keys = self.primary_keys;
      var condition = {};
      
      if(this[field] === null){
        return next(true);
      }
      
      condition[field] = this[field];
      
      for(var i = 0; i < primary_keys.length; i++){
        if(this[primary_keys[i]]){
          condition[primary_keys[i] + '_not'] = this[primary_keys[i]];
        }        
      }
      
      if(options.scope){
        condition[options.scope] = this[options.scope];
      }
      
      
      self.model.count().where(condition).exec(function(result){
        if(result && result.count > 0){
          records.errors.add(field, 'not uniq');
          return next(false);
        }
        next(true);
      });      
    });
  }
};