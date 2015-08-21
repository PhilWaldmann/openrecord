var validator = require('validator');
var hstore = require('hstore.js');

exports.store = {
  
  mixinCallback: function(){
    var store = this;
        
    this.addType('hstore', {
      output: function(val){
        if(!val) return {};
        return val;
      },
      
      read: function(val){
        if(val instanceof Object) return val;
        if(val === null) return null;
        
        var tmp = null;
        
        try{
          tmp = hstore.parse(val, {numeric_check: true});
        }catch(e){
          return null;
        }
        
        
        for(var key in tmp){
          if(tmp.hasOwnProperty(key) && typeof tmp[key] === 'string' && tmp[key].match(/(\{|\[)/)){
            try{
              tmp[key] = JSON.parse(tmp[key]);
            }catch(e){}
          }
        }
        
        return tmp;
      },
      write: function(object){
        if(object === null) return null;
        
        for(var key in object){
          if(object.hasOwnProperty(key) && typeof object[key] === 'object'){
            object[key] = JSON.stringify(object[key]);
          }
        }
        
        return hstore.stringify(object);
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