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
        return buffer.toString('binary');
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
      return curr_year + "-" + (curr_month < 10 ? '0'+curr_month : curr_month) + "-" + (curr_date < 10 ? '0'+curr_date : curr_date); //NEEDS HUGE IMPROVEMENTS!!!
    }, {migration:'date'});
    
    this.addType('datetime', function(value){
      if(value === null) return null;
      return validator.toDate(value);
    }, {migration:'datetime'});
    
    this.addType('time', {
      input: function(value){
        if(value === null || value == '') return null;
        if(value instanceof Date) value = value.toString();
        return value.replace(/.*(\d{2}:\d{2})(:\d{2}).*/, "$1");
      },
      output: function(value){
        if(value === null || value == '') return null;
        if(value instanceof Date){
          var hour = value.gethours();
          var minute = value.getMinutes();
          return (hours < 10 ? '0'+hours : hour) + ':' + (minute < 10 ? '0'+minute : minute);
        }
        return value;
      }
    }, {migration:'time'});
    
    
    this.addType('string', function(value){
      if(value === null) return null;
      return validator.toString(value);
    }, {migration:['string', 'text']});
      
      
      
      
    this.addType('hstore', {
      //from https://github.com/brianc/node-postgres/issues/140
      input: function(val){
        if(val instanceof Object) return val;
        if(val === null) return null;
        
        var object = {};
         var values = [];

         var i = 1;
         var start = 1;

         while(i < val.length) {
           c = val.charAt(i);
           if(c == '\\') {
             i = i + 2;
           } else if(c == '"') {
             values.push(val.substring(start, i));
             i = i + 4;
             start = i;
           } else {
             i++;
           }
         }

         for(i = 0; i < values.length; i = i + 2) {
           var v = values[i+1];           
           if(v.match(/\|\|\|/)){ //auto split arrays concatenated via |||
             v = v.split('|||');
           }
           object[values[i]] = v;
         }

         return object;
      },
      output: function(object){
        if(object === null) return null;
        //from https://github.com/bjpirt/backbone-postgresql/blob/master/backbone-postgresql.js#L134-162
        
        function quoteAndEscape(string) {
          return "\"" + String(string).replace(/"/g, "\\\"") + "\"";
        }
        
        var key, val;
        
        var results = [];
        for (key in object) {
          val = object[key];
          switch (typeof val) {
            case "boolean":
              val = (val ? quoteAndEscape("true") : quoteAndEscape("false"));
              break;
            case "object":
              val = (val ? quoteAndEscape(JSON.stringify(val)) : "NULL");
              break;
            case "null":
              val = "NULL";
              break;
            case "number":
              val = (isFinite(val) ? quoteAndEscape(JSON.stringify(val)) : "NULL");
              break;
            default:
              val = quoteAndEscape(val);
          }
          results.push("\"" + key + "\"=>" + val);
        }
        
        return results.join(", ");
      }
    }, {migration:['hstore']});
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


