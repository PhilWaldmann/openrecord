var validator = require('validator');
var async = require('async');

var Utils = require('../utils');
var Store = require('../store');




/*
 * STORE
 */
exports.store = {    
  mixinCallback: function(){    
    this.addInterceptor('beforeValidation');
  }
};



/*
 * DEFINITION
 */
exports.definition = {  

  mixinCallback: function(){
    this.validations = {};
  },
  
  /**
   * Validate any field with a custom function. 
   * Synchronous: just return `true` or `false`
   * Asynchronous: put a `done` parameter into your callback and call `done()` when finished.
   *
   * @area Definition/Validations
   * @method validates
   * @param {array} fields - The fields to validate
   * @param {function} callback - The validation callback
   *
   * @callback
   * @param {function} done - Optional: If you need a async validation, just call `done()` when finished
   * @scope Record
   *
   * @return {Definition}
   */
  validates: function(fields, fn){    
    if(typeof fields == 'function'){
      fn = fields;
      fields = '__base';
    }
    if(!fn){ this.handleException(new Store.NoCallbackError())}
    if(!(fields instanceof Array)) fields = [fields];
    
    for(var i in fields){
      var attr = fields[i];
      this.validations[attr] = this.validations[attr] || [];
      
      //allow for fn to be fn() and fn(next)...
      this.validations[attr].push(function(next){
        if(fn.length == 0){
          next(null, fn.call(this));
        }else{
          fn.call(this, function(result){
            next(null, result);
          });
        }
      });
    }
    
    return this;
  },
  
  
  /**
   * This validator checks the given field`s value is not null.
   * @area Definition/Validations
   * @method validatesPresenceOf
   * @param {array} fields - The fields to validate
   *
   * @return {Definition}
   */
  validatesPresenceOf: function(){
    var args = Utils.args(arguments);
    if(args.length > 1){
      return this.validateFieldsHelper(args, this.validatesPresenceOf);
    }
    
    var field = args[0];
    
    return this.validates(field, function(){
      var valid = this[field] != null;
      if(!valid) this.errors.add(field, 'not valid');
      return valid;
    });
  },
  
  
  /**
   * This validator checks if the given field`s value and <field_name>_confirmation are the same.
   * @area Definition/Validations
   * @method validatesConfirmationOf
   * @param {array} fields - The fields to validate
   *
   * @return {Definition}
   */
  validatesConfirmationOf: function(){
    var args = Utils.args(arguments);
    if(args.length > 1){
      return this.validateFieldsHelper(args, this.validatesConfirmationOf);
    }
    
    var field = args[0];
    var confirmation_field = field + '_confirmation';
    
    return this.validates(field, function(){
      var valid = (this[field] == this[confirmation_field]);
      if(!valid) this.errors.add(field, 'confirmation error');
      return valid;
    });
  },
  
  
  /**
   * This validator checks the format of a field.
   * Valid format types are:
   * - `email`
   * - `url`
   * - `ip`
   * - `uuid`
   * - `date` 
   * - null
   * - Regular expression
   * 
   * @area Definition/Validations
   * @method validatesFormatOf
   * @param {array} fields - The fields to validate
   * @param {string/RegExp/null} format - The format type
   *
   * @return {Definition}
   */
  validatesFormatOf: function(field, format){
    if(field instanceof Array){
      return this.validateFieldsHelper(field, [format], this.validatesFormatOf);
    }

    return this.validates(field, function(){
      var valid = false;
      var value = this[field];
      
      switch(format){
        case 'email':
          valid = validator.isEmail(value);  
          break;
          
        case 'url':
          valid = validator.isURL(value);
          break;
          
        case 'ip':
          valid = validator.isIP(value);
          break;
          
        case 'uuid':
          valid = validator.isUUID(value);
          break;
          
        case 'date':
          valid = validator.isDate(value);
          break;
          
        case null:
          valid = validator.isNull(value);
          break;
        default:
          valid = validator.matches(value, format);
          break;
      }      
      
      if(!valid) this.errors.add(field, 'not a valid format');
      return valid;
    });
  },
    
  
  
  validateFieldsHelper: function(fields, args, fn){
    if(typeof args == 'function'){
      fn = args;
      args = [];
    }
    
    for(var i in fields){
      fn.apply(this, [fields[i]].concat(args));
    }
    return this;
  }
};





/*
 * RECORD
 */
exports.record = {
  validate: function(callback){
    var validations = [];
    var self = this;
    
    callback = callback.bind(this);
    
    this.callInterceptors('beforeValidation', [], function(okay){
      if(okay){
        for(var field in self.definition.validations){
          var field_validations = self.definition.validations[field];
      
          //set the scope of all validator function to the current record
          for(var i in field_validations){
            validations.push(field_validations[i].bind(self));
          }
        }

        async.parallel(validations, function(err, results){
          callback(results.indexOf(false) == -1);
        });
      }else{
        callback(false);
      }
    });
  },
  
  
  isValid: function(callback){
    var self = this;
    
    if(self.errors.length == 0){
      //TODO!!
    }
    
    this.validate(function(valid){
      callback.call(this, valid);
    });
  }
}