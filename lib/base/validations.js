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
   * @class Definition
   * @method validates
   * @param {array} fields - The fields to validate
   * @param {function} callback - The validation callback
   *
   * @callback
   * @param {function} done - Optional: If you need a async validation, just call `done()` when finished
   * @this Record
   *
   * @return {Definition}
   */
  validates: function(fields, fn){    
    if(typeof fields == 'function'){
      fn = fields;
      fields = '__base';
    }
    if(!fn){ return this.definition.store.handleException(new Store.NoCallbackError())}
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
   * @class Definition
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
      var valid = this[field] != null; //TODO: typecast value????!
      if(!valid) this.errors.add(field, 'not valid');
      return valid;
    });
  },
  
  
  /**
   * This validator checks if the given field`s value and <field_name>_confirmation are the same.
   * @class Definition
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
   * * `email`
   * * `url`
   * * `ip`
   * * `uuid`
   * * `date` 
   * * null
   * * Regular expression
   * 
   * @class Definition
   * @method validatesFormatOf
   * @param {array} fields - The fields to validate
   * @param {string/RegExp/null} format - The format type
   * @param {object} options - The options hash
   *
   * @options
   * @param {boolean} allow_null - Skip validation if value is null
   *
   * @return {Definition}
   */
  validatesFormatOf: function(field, format, options){
    options = options || {};
    
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
          
      if(value === null && options.allow_null) return true;
      
      if(!valid) this.errors.add(field, 'not a valid format');
      return valid;
    });
  },
    
  
  
  /**
   * This validator checks if the given field`s values length is lesss than or equal `length`.
   * @class Definition
   * @method validatesLengthOf
   * @param {string} field - The field to validate
   * @param {integer} length - The maximum length
   *
   * @return {Definition}
   */
  validatesLengthOf: function(field, length){    
    return this.validates(field, function(){
      var valid = true;
      if(this[field]) valid = (this[field].length <= length);
      if(!valid) this.errors.add(field, 'maximum length of ' + length + ' exceeded');
      return valid;
    });
  },
  
  
  
  /**
   * This validator checks if the given field`s values length.
   * @class Definition
   * @method validatesNumericalityOf
   * @param {string} field - The field to validate
   * @param {object} options - The options hash
   *
   * @options
   * @param {boolean} allow_null - Skip validation if value is null
   * @param {integer} eq - value need to be equal `eq`
   * @param {integer} gt - value need to be greater than `gt`
   * @param {integer} gte - value need to be greater than or equal `gte`
   * @param {integer} lt - value need to be lower than `lt`
   * @param {integer} lte - value need to be lower than or equal `lte`
   * @param {boolean} even - value need to be even
   * @param {boolean} off - value need to be odd
   *
   * @return {Definition}
   */
  validatesNumericalityOf: function(field, options){    
    return this.validates(field, function(){
      var valid = true;
      var value = this[field];
            
      if(options.eq !== undefined && options.eq != value) valid = false;
      if(options.gt !== undefined && options.gt >= value) valid = false;
      if(options.gte !== undefined && options.gte > value) valid = false;
      if(options.lt !== undefined && options.lt <= value) valid = false;
      if(options.lte !== undefined && options.lte < value) valid = false;
      if(options.even !== undefined && (value % 2) == 1) valid = false;
      if(options.odd !== undefined && (value % 2) == 0) valid = false;
      
      if(options.allow_null === true && value === null) valid = true;

      if(!valid) this.errors.add(field, 'not a valid number');
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
  /**
   * validates the record
   *
   * @class Record
   * @method validate
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {boolean} result - `true` or `false`
   * @this Promise
   */
  validate: function(resolve, reject){
    var self = this;
    var validations = [];
        
    return self.promise(function(resolve, reject){
      
      self.callInterceptors('beforeValidation', [self], function(okay){
        if(okay){
          for(var field in self.definition.validations){
            var field_validations = self.definition.validations[field];
      
            //set the scope of all validator function to the current record
            for(var i in field_validations){
              validations.push(field_validations[i].bind(self));
            }
          }

          async.parallel(validations, function(err, results){
            var valid =  results.indexOf(false) == -1;
            
            self.callInterceptors('afterValidation', [self, valid], function(okay){
              if(okay){
                if(valid){
                  resolve(true);
                }else{
                  resolve(false);
                }
              }else{
                resolve(false);
              }
            }, reject);
            
          });
          
        }else{
          resolve(false);
        }
      }, reject);
      
    }, resolve, reject);
  
  },
  
  
  isValid: function(callback){
    this.validate(function(valid){
      callback.call(this, valid);
    });
  }
}