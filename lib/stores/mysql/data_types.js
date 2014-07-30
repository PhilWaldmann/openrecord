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
        return moment(value).toDate();
      },
      input: function(value){
        if(value === null) return null;
        return moment(value).toDate();
      },
      write: function(value){
        if(value === null) return null;
        return moment(value).format('YYYY-MM-DD');
      },
      output: function(value){
        if(value === null) return null;
        return moment(value).format('YYYY-MM-DD');
      }
    }, {migration:'date'});
    
    
    this.addType('datetime', function(value){
      if(value === null) return null;
      return moment(value);
    }, {migration:'datetime'});
    
    
    this.addType('time', {
      read: function(value){
        if(value === null) return null;
        return moment(value).toDate();
      },
      input: function(value){
        if(value === null) return null;
        return moment(value).toDate();
      },
      write: function(value){
        if(value === null) return null;
        return moment(value).format('HH:mm:ss');
      },
      output: function(value){
        if(value === null) return null;
        return moment(value).format('HH:mm:ss');
      }
    }, {migration:'time'});
    
    
    this.addType('string', function(value){
      if(value === null) return null;
      return validator.toString(value);
    }, {migration:['string', 'text']});
      
    
  }
};