var Store = require('../store');

Store.addExceptionType(function ReservedAttributeError(attr){
  Error.apply(this);
  this.message = 'Attribute "' + attr + '" is reserved';
});



/**
 * The error object on the Record is a simple Object with one method `add`
 * You could add validation errors to that object via
 * ```js
 *  this.errors.add('my_field', 'Some error');
 * ```
 * 
 * which will result in the following error object
 * ```
 * {my_field: ['Some error']}
 * ```
 *
 * @area Record
 * @name The Error Object
 */

var ValidationError = function(){
  
};

ValidationError.prototype.add = function(name, message){
  if(!message){
    message = name;
    name = 'base';
  }
  
  if(name === 'add') throw new Store.ReservedAttributeError('add');
  
  this[name] = this[name] || [];
  this[name].push(message);
};

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(){
    this.errors = new ValidationError();
  }
};
