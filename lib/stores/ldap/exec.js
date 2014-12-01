var ldap  = require('ldapjs');

exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.onFind(function(options, data, next){

      if(options.filter.filters.length === 0){
        options.filter = null;     
      }
      
      this.connection.search(options.root, options, options.controls || [], function(err, res){

        self.logger.info('Search ' + options.root + ' (Scope=' + options.scope + ', Filter=' + options.filter.toString() + ', Attributes=' + options.attributes);
        console.log('Search ' + options.root + ' (Scope=' + options.scope + ', Filter=' + options.filter.toString() + ', Attributes=' + options.attributes);

        if(err) data.error = err;
        
        
        var records = [];
      
        // get search resutls
        res.on('searchEntry', function(entry) {
          records.push(entry.object);
        });

        //finished search... 
        res.on('end', function(result) {
          data.result = records;
          next();          
        });

        res.on('error', function(err) {
          if(err instanceof ldap.NoSuchObjectError){
            return next()
          }
          data.error = err;
          next();
        });
        
      });
    });
  }
}


/*
 * MODEL
 */
exports.model = {
  
  getExecOptions: function(){
    return {
      filter:new ldap.AndFilter({filters: []})
    };
  }
  
};

/*
exports.model = {
  exec: function(resolve, reject){
    var self = this.chain();

    var options = {};    
    
    return self.promise(function(resolve, reject){
      
      self.callInterceptors('beforeFind', [options], function(okay){
        if(okay){
         
          
          //console.log('Search ' + options.root + ' (Scope=' + options.scope + ', Filter=' + options.filter.toString() + ', Attributes=' + options.attributes);
         
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
              if(err instanceof ldap.NoSuchObjectError){
                return resolve(null);
              }
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
*/