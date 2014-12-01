var validator = require('validator');

exports.store = {

  mixinCallback: function(){
        
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
    }, {
      migration:['hstore'],
      operators:{
        defaults: ['eq', 'not']
      }
    });
        
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