var util = require('util');
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
 * @class Record
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
  if(name === 'set') throw new Store.ReservedAttributeError('set');
  if(name === 'each') throw new Store.ReservedAttributeError('each');
  if(name === 'toJSON') throw new Store.ReservedAttributeError('toJSON');

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

ValidationError.prototype.each = function(callback){
  for(var name in this){
    if(this.hasOwnProperty(name) && util.isArray(this[name])){
      for(var i = 0; i < this[name].length; i++){
        if(typeof callback === 'function') callback(name, this[name][i]);
      }
    }
  }
};


ValidationError.prototype.toJSON = function(){
  var tmp = {};
  var has_errors = false;

  for(var name in this){
    if(this.hasOwnProperty(name) && typeof this[name] !== 'function' && containsErrors(this[name])){
      tmp[name] = this[name];
      has_errors = true;
    }
  }

  if(has_errors) return tmp;
  return;
}


ValidationError.prototype.toString = function(){
  var tmp = [];
  var has_errors = false;

  for(var name in this){
    if(this.hasOwnProperty(name) && typeof this[name] !== 'function' && containsErrors(this[name])){
      tmp.push((name === 'base' ? '' : name + ': ') + this[name].join(', '));
      has_errors = true;
    }
  }

  if(has_errors) return tmp.join('\n');
  return '';
}



function containsErrors(errors){
  if(typeof errors === 'string') return true;

  for(var i = 0; i < errors.length; i++){
    if(typeof errors[i] == 'string') return true;
    if(util.isArray(errors[i]) && containsErrors(errors[i])) return true;
    if(!util.isArray(errors[i]) && typeof errors[i] === 'object'){
      for(var name in errors[i]){
        if(errors[i].hasOwnProperty(name)){
          if(containsErrors(errors[i][name])) return true;
        }
      }
    }
  }

  return false;
}




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

      if(options.type == 'has_many' || options.type == 'belongs_to_many'){
        parent.errors[options.name] = parent.errors[options.name] || [];
        parent.errors[options.name].push(record.errors);
      }else{
        parent.errors[options.name] = record.errors;
      }


    });

  }
}
