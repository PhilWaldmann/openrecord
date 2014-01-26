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
        console.log(query.toString());
        self.callInterceptors('beforeQuery', self, [query], function(okay){
          if(okay){
            query.exec(function(err, resp) { 
              if(err){
                throw new Error(err); //TODO Error handling
              }
              self.callInterceptors('afterFind', self, [resp], function(okay){
                callback(okay ? resp : null);
              });
            });
          }else{
            callback(null);
          }          
        });
      }else{
        callback(null);
      }
    });
  
    return self;
  },
  
  
  
  toSql: function(){
    var sql;
    var query = this.query;
    
    this.callInterceptors('beforeFind', this, [query], function(okay){
      sql = query.toString();
    });
    
    return sql;
  }
  
};