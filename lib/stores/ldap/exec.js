//var Helper = require('./helper');
var Utils = require('../../utils');


exports.model = {
  exec: function(resolve, reject){
    var self = this.chain();
    
    var root = 'dc=test';
    var options = {
      scope: 'sub', 
      filter: 'objectClass=' + self.definition.getName(),
      attributes: ['objectClass', 'name', 'objectGUID', 'whenCreated', 'whenChanged', 'sAMAccountName', 'givenName', 'sn', 'memberOf', 'uSNChanged', 'isDeleted']
    };
    
    return self.promise(function(resolve, reject){
      
      self.callInterceptors('beforeFind', [options], function(okay){
        if(okay){        
          
          self.connection.search(root, options, function(err, res){

            if(err){
              return reject(err);
            }                    
          
            var records = [];
          
            //get one entry...
            res.on('searchEntry', function(entry) {
              console.log('>', entry.object);
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