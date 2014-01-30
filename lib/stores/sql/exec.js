/*
 * MODEL
 */
exports.model = {

  exec: function(callback){
    var self = this.chain();
    var query = self.query;
    /*var conditions = this.getInternal('conditions');
  
    for(var i in conditions){
      this._addCondition(conditions[i]);
    }
  
    
    */
    
    //TODO make it nicer
    self.callInterceptors('beforeFind', self, [query], function(okay){
      if(okay){        
        if(okay){
          query.exec(function(err, resp) { 
            if(err){
              throw new Error(err); //TODO Error handling
            }
                        
            var data = {
              sql: query.toString(),
              result: resp
            };
            
            self.callInterceptors('afterFind', self, [data], function(okay){
              callback(okay ? data.result : null);
            });
          });
        }else{
          callback(null);
        }     
        
      }else{
        callback(null);
      }
    });
  
    return self;
  },
  
  
  
  toSql: function(){
    var sql;
    var query = this.query;
    
    //make async?
    this.callInterceptors('beforeFind', this, [query], function(){
      sql = query.toString();
    });
    
    return sql;
  }
  
};