var validator = require('validator');

exports.store = {
  
  mixinCallback: function(){
    var store = this;
        
    this.addType('hstore', {
      output: function(val){
        if(!val) return {};
        return val;
      },
      
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
      },
      
      sorter: function(name){
        var tmp = name.match(/(.+)\.([a-zA-Z\_\-]+)$/);
        if(tmp){
          return store.connection.raw(tmp[1] + "->'" + tmp[2] + "'");
        }
        return name;
      }
    });
        
  }
};