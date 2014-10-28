var validator = require('validator');
var moment = require('moment');
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
      read: function(value){
        if(value === null) return null;
        return new Buffer(value, 'binary');
      },
      write: function(buffer){
        if(buffer === null) return null;
        return buffer.toString('hex');
      }
    }, {migration:'binary', extend: Buffer});
    
    
    this.addType('boolean', function(value){
      if(value === null) return null;
      return validator.toBoolean(value);
    }, {migration:'boolean'});
    
    
    this.addType('date', {
      read: function(value){
        if(value === null) return null;
        return moment(value).format('YYYY-MM-DD');
      },
      input: function(value){
        if(value === null) return null;
        return moment(value).format('YYYY-MM-DD');
      },
      write: function(value){
        return value;
      },
      output: function(value){
        return value;
      }
    }, {migration:'date'});
    
    
    this.addType('datetime', function(value){
      if(value === null) return null;
      return moment(value).toDate();
    }, {migration:'datetime'});
    
    
    this.addType('time', {
      read: function(value){
        return value;
      },
      input: function(value){
        if(value === null) return null;
        
        //from http://www.timlabonne.com/2013/07/parsing-a-time-string-with-javascript/
        var dt = moment();
 
        var time = value.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
        if (!time) {
            return null;
        }
        var hours = parseInt(time[1], 10);
        if (hours == 12 && !time[3]) {
            hours = 0;
        }
        else {
            hours += (hours < 12 && time[3]) ? 12 : 0;
        }
 
        dt.hours(hours);
        dt.minutes(parseInt(time[2], 10) || 0);
        dt.seconds(0, 0);
        
        return dt.format('HH:mm:ss');        
      },
      write: function(value){
        return value;
      },
      output: function(value){
        return value;
      }
    }, {migration:'time'});
    
    
    this.addType('string', function(value){
      if(value === null) return null;
      return validator.toString(value);
    }, {migration:['string', 'text']});
      
    
  }
};