exports.store = {
  mixinCallback: function(){
    
    //TODO: into base?
    this.toArrayCastTypes = function(from_type){
      
      var type = this.attribute_types[from_type];
      if(type){
        var castfn = function(cast_type){

          return function(value){
            if(value === null) return null;
            if(typeof value === 'string' && value.match(/^\{(.+)+\}$/)){
              value = value.replace(/(^\{|\}$)/g, '').split(',');
            }
            
            if(!(value instanceof Array)) value = [value];

            return value.map(function(v){
              return type.cast[cast_type].call(this, v);
            });
          };
        };
        
        var tmp = {};
        
        for(var cast_type in type.cast){
          if(typeof type.cast[cast_type] === 'function'){
            tmp[cast_type] = castfn(cast_type);
          }
        }
        
        return tmp;
      }
    };
    
  }
};
