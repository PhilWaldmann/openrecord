var util = require('util');

exports.migration = {
  
  mixinCallback: function(){
    var self = this;
    
    for(var i in this.store.attribute_types){
      if(this.store.attribute_types.hasOwnProperty(i)){
        var type = this.store.attribute_types[i];
        
        if(!type.migration) continue;
        if(!util.isArray(type.migration)) type.migration = [type.migration];

        for(var d = 0; d < type.migration.length; d++){

          if(typeof type.migration[d] === 'object'){
            for(var name in type.migration[d]){
              self[name] = self._addColumnTypeFn(type.migration[d][name]);  
            }
          }else{
            self[type.migration[d]] = self._addColumnTypeFn(type.migration[d]);  
          }           
        }
      }
    }
  },
  
  
  
  _defineColumnTypeFn: function(type, name, options){
    var self = this;
    return function(table){

      if(type == 'datetime'){ //TODO: better solution?!
        type = 'dateTime';
      }
            
      var fn = table[type];
      var column;
            
      if(typeof fn == 'function'){
        column = fn.call(table, name);
      }else{
        column = table.specificType(name, type);
      }
      
      self.setColumnOptions(column, options);      
    };
  },
  
  _addColumnTypeFn: function(type){
    var self = this;
    return function(table, name, options){
      if(typeof table == 'string' && typeof name == 'string'){
        options = options || {};
    
        //add column to existing table
        self.addColumn(table, self._defineColumnTypeFn(type, name, options));      
      }else{
        options = name || {};
        name = table;
      
        //inside a createTable()
        self.fields.push(self._defineColumnTypeFn(type, name, options));       
      }
    };
  },
  
  
  
  increments: function(){
    this._addColumnTypeFn('increments').apply(this, arguments);
  }
  
};