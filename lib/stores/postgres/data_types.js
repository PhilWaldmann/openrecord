var validator = require('validator');
var util = require('util');

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){ 
    
    this.addType('integer', function(value){
      return validator.toInt(value);
    });
    
    this.addType('float', function(value){
      return validator.toFloat(value);
    });
    
    this.addType('buffer', {
      input: function(value){
        return new Buffer(value, 'binary');
      },
      output: function(buffer){
        return buffer.toString('hex');
      }
    });
    
    this.addType('boolean', function(value){
      return validator.toBoolean(value);
    });
    
    
    this.addType('date', function(value){
      return new DateOnly(value);
    });
    
    this.addType('datetime', function(value){
      return validator.toDate(value);
    });
    
    this.addType('time', function(value){
      return new TimeOnly(value);
    });
    
    
    this.addType('string', function(value){
      return validator.toString(value);
    });
    
    
  }
};


var DateOnly = function(value){
  Date.call(this, validator.toDate(value));
};

util.inherits(DateOnly, Date);

DateOnly.prototype.toString = function(){
  return 'foo';
};



var TimeOnly = function(value){
  Date.call(this, validator.toDate(value));
};

util.inherits(TimeOnly, Date);

TimeOnly.prototype.toString = function(){
  return 'bar';
};


