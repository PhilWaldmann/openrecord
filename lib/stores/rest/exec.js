exports.model = {
  exec: function(resolve, reject){
    var self = this.chain();

    var options = {
      path: '/' + self.definition.resource,
      params: {}
    };
    
    self.promise(function(resource, reject){
      
      self.callInterceptors('beforeFind', self, [options], function(okay){
        if(okay){        

          self.connection.get(options, function(err, req, res, obj){
          
            err = err | obj[self.errorParam || 'error'];

            if(err){
              return reject(err);
            }                    
          
            options.result = obj;

            self.callInterceptors('afterFind', self, [options], function(okay){
              if(okay){
                resolve(options.result);              
              }else{
                resolve(null);
              }
            }, reject);
          });
        
        }else{
          resolve(null);
        }
      }, reject);
      
    }, resolve, reject);
    
    return self;
  }
}