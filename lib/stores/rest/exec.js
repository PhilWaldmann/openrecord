exports.model = {
  exec: function(callback){
    var self = this.chain();
    
    var options = {
      path: '/' + this.definition.resource,
      params: {}
    };
    
    //TODO make it nicer
    self.callInterceptors('beforeFind', self, [options], function(okay){
      if(okay){        

        self.connection.get(options, function(err, req, res, obj){
          
          if(err){
            throw new Error(err); //TODO Error handling
          }
          
          options.result = obj;
          
          self.callInterceptors('afterFind', self, [options], function(okay){
            callback(okay ? options.result : null);
          });
        });
        
      }else{
        callback(null);
      }
    });
    
    return self;
  }
}