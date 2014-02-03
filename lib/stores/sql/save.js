/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var exists = config ? (config.__exists === true) :false;
    
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
}