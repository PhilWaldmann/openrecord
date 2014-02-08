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

var Error = function(){
  
};

Error.prototype.add = function(name, message){
  if(message == null){
    message = name;
    name = 'base';
  }
  
  if(name == 'add') throw new Error("'add' is reservated");
  
  this[name] = this[name] || [];
  this[name].push(message);
};

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(){
    this.errors = new Error();
  }
};
