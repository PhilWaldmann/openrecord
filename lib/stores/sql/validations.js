var Utils = require('../../utils');

/*
 * DEFINITION
 */
exports.definition = {
  validatesUniquenessOf: function(){
    var args = Utils.args(arguments);
    if(args.length > 1){
      return this.validateFieldsHelper(args, this.validatesUniquenessOf);
    }
    
    var field = args[0];
    var self = this;
    
    return this.validates(field, function(next){
      var records = this;
      var primary_keys = self.primary_keys;
      var condition = {};
      
      condition[field] = this[field];
      
      for(var i = 0; i < primary_keys.length; i++){
        if(this[primary_keys[i]]){
          condition[primary_keys[i] + '_not'] = this[primary_keys[i]];
        }        
      }
      
      self.model.count().where(condition).exec(function(result){
        if(result.count > 0){
          records.errors.add(field, 'not uniq');
          return next(false);
        }
        next(true);
      });      
    });
  }
};