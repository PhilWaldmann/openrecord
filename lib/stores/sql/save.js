/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var exists = config ? (config.__exists === false) : false;
    Object.defineProperty(this, '__exists', {enumerable: false, writable: false, value: exists});
  },
    
  save: function(callback){
    var definition = this.definition;
    
    this.validate(function(valid){
      if(valid){
        var self = this;

        //check if record is new...

        definition.query().insert(this.attributes).exec(function(err, result){
          if(err) self.definition.emit('error', err);
          callback(err == null);
        });
        
      }else{
        callback(false);
      }
    });
        
    return this;
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){          
    this.afterFind(function(data){
      var records = data.result;
      var as_json = this.getInternal('as_json');
      
      if(!as_json){
        for(var i = 0; i < records.length; i++){
          records[i].__exists = true;
        }
      }      
         
      return true;
    }, 60);
    
  }
};