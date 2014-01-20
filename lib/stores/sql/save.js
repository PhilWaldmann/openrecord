/*
 * RECORD
 */
exports.record = {
  save: function(callback){

    this.validate(function(valid){
      if(valid){
        var self = this;

        //check if record is new...

        this.query.insert(this.attributes).exec(function(err, result){
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