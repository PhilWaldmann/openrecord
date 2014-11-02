exports.model = {
  exec: function(resolve, reject){
    var self = this.chain();

    var options = {};    
    
    return self.promise(function(resolve, reject){
      
      self.callInterceptors('beforeFind', [options], function(okay){
        if(okay){

          self.connection.search(options.root, options, options.controls || [], function(err, res){

            if(err){
              return reject(err);
            }                    
          
            var records = [];
          
            // get search resutls
            res.on('searchEntry', function(entry) {
              records.push(entry.object);
            });

            //finished search... 
            res.on('end', function(result) {

              options.result = records;
              
              self.callInterceptors('afterFind', [options], function(okay){
                if(okay){
                  resolve(options.result);              
                }else{
                  resolve(null);
                }
              }, reject);
              
            });

            res.on('error', function(err) {
              reject(err);
            });
            
          });
        
        }else{
          resolve(null);
        }
      }, reject);
      
    }, resolve, reject);
  }
};