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
        return buffer.toString('binary');
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
        return moment(value).format('YYYY-MM-DD ZZ');
      },
      output: function(value){
        if(value === null) return null;
        return moment(value).format('YYYY-MM-DD');
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
        var dt;
        
        if(typeof value === 'string'){
          //from http://www.timlabonne.com/2013/07/parsing-a-time-string-with-javascript/
          dt = moment();
        
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
          dt.moniutes(parseInt(time[2], 10) || 0);
          dt.seconds(0, 0);
        }else{
          dt = moment(value);
        }
        
        return dt.format('HH:MM:ss');        
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
      
      
      
      
    this.addType('hstore', {
      //from https://github.com/brianc/node-postgres/issues/140
      read: function(val){
        if(val instanceof Object) return val;
        if(val === null) return null;
        
        var object = {};
        var values = [];

        var i = 1;
        var start = 1;

        while(i < val.length) {
          var c = val.charAt(i);
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
          try{
            v = JSON.parse(v.replace(/\\"/g, '"'));
          }catch(e){}
          object[values[i]] = v;
        }

        return object;
      },
      write: function(object){
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





// POSTGRES HSTORE - CHECK CHANGES


//TODO: move into the base classes!
function objectHash(obj){
  if(!obj) return null;
  return JSON.stringify(obj)
  .split('')
  .reduce(function(a,b){
    a=((a<<5)-a)+b.charCodeAt(0);
    return a&a
  },0);
}


exports.record = {
  set: function(name, value){
    
    this.callParent(name, value);
        
    var attributes = this.definition.attributes;
    for(var field in attributes){
      if(attributes.hasOwnProperty(field)){
        var attr = attributes[field];
        if(attr.type.name == 'hstore' && (name === field || name[field])){
          this.__hstore_hash = this.__hstore_hash || {};
          this.__hstore_hash[field] = objectHash(this[field]);
        }
      }
    }    
  }
};

exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.beforeSave(function(record){
      for(var name in self.attributes){
        if(self.attributes.hasOwnProperty(name)){
          var attr = self.attributes[name];
          if(attr.type.name == 'hstore' && !record.hasChanged(name)){
            var hash = objectHash(record[name]);

            if(!record.__hstore_hash || (hash != record.__hstore_hash[name])){
              record.changes[name] = [null, record[name]];
              
              record.__hstore_hash = record.__hstore_hash || {};
              record.__hstore_hash[name] = hash;
            }
          }
        }
      }      
      return true;
    });
  }
}

