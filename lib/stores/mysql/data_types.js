var validator = require('validator');
var util = require('util');

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){ 
    
    this.addType('integer', function(value){
      if(value === null) return null;
      return validator.toInt(value);
    }, {migration:'integer'});
    
    this.addType('float', function(value){
      if(value === null) return null;
      return validator.toFloat(value);
    }, {migration:'float'});
    
    this.addType('binary', {
      input: function(value){
        if(value === null) return null;
        return new Buffer(value, 'binary');
      },
      output: function(buffer){
        if(buffer === null) return null;
        return buffer.toString('hex');
      }
    }, {migration:'binary'});
    
    this.addType('boolean', function(value){
      if(value === null) return null;
      return validator.toBoolean(value);
    }, {migration:'boolean'});
    
    
    this.addType('date', function(value){
      if(value === null) return null;
      var d = validator.toDate(value);
      var curr_date = d.getDate();
      var curr_month = d.getMonth() + 1; //Months are zero based
      var curr_year = d.getFullYear();
      return curr_year + "-" + (curr_month < 10 ? '0'+curr_month : curr_month) + "-" + (curr_date < 10 ? '0'+curr_date : curr_date);
    }, {migration:'date'});
    
    this.addType('datetime', function(value){
      if(value === null) return null;
      return validator.toDate(value);
    }, {migration:'datetime'});
    
    this.addType('time', function(value){
      if(value === null) return null;
      return value.replace(/.*(\d{2}:\d{2})(:\d{2}).*/, "$1");
    }, {migration:'time'});
    
    
    this.addType('string', function(value){
      if(value === null) return null;
      return validator.toString(value);
    }, {migration:['string', 'text']});
      
    
  }
};

/*
var DateOnly = function(value){
  Date.call(this, validator.toDate(value));
};

util.inherits(DateOnly, Date);

DateOnly.prototype.toString = function(){
  return '';
};



var TimeOnly = function(value){
  Date.call(this, validator.toDate(value));
};

util.inherits(TimeOnly, Date);

TimeOnly.prototype.toString = function(){
  return '';
};
*/


