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
    
    return this.validates(field, function(next){
      var self = this;
      //TODO: find record with same field value...
      setTimeout(function(){
        self.errors.add(field, 'not uniq');

        next(null, false);
      }, 1000);      
    });
  }
};