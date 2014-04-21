var Helper = require('./helper');
var Utils = require('../../utils');


exports.model = {
  exec: function(resolve, reject){
    var self = this.chain();

    var action = self.getInternal('action') || 'index';
    var options = Utils.clone(self.definition.actions[action]);
    
    return self.promise(function(resolve, reject){
      
      self.callInterceptors('beforeFind', self, [options], function(okay){
        if(okay){        
          
          Helper.applyParams(options);
          //console.log(options.path);
          self.connection.get(options, function(err, req, res, obj){

            err = err || obj[self.errorParam || 'error'];

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
  }
};