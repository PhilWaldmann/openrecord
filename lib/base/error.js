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
 * @section Record
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

ValidationError.prototype.set = function(object){
  for(var name in object){
    if(object.hasOwnProperty(name)){
      this[name] = this[name] || [];
      this[name].push(object[name]);
    }
  }
};

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(){
    this.errors = this.errors || new ValidationError();
  }
};

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    
    //Add a reference of the relation error object to itself
    this.on('relation_record_added', function(parent, options, record){

      //it's possible that a records gets relations added before it get it's error object assigned (see above)
      parent.errors = parent.errors || new ValidationError(); 
      record.errors = record.errors || new ValidationError();
      
      if(options.type == 'has_many'){
        parent.errors[options.name] = parent.errors[options.name] || [];
        parent.errors[options.name].push(record.errors);
      }else{
        parent.errors[options.name] = record.errors;
      }
      
      
    });
    
  }
}
