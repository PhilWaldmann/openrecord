var Promise = require('bluebird/js/main/promise')();


/*
 * MODEL
 */
exports.model = {
  
  exec: function(callback){
    return this.then(callback);
  },
  
  then: function(onFulfilled, onRejected) {
    var self = this.chain();
    var promise = self.getInternal('promise');
    
    if (!promise) {
      var promise = Promise.try(function(a){
        return self._find();
      })
      .then(onFulfilled, onRejected)
      .bind(self);
      
      self.setInternal('promise', promise);
    }
    
    return promise;
  },
  
  /**
   * Executes the find
   * @area Model/Find
   * @method exec
   * @param {function} callback - The callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @scope Collection
   */
  _find: function(){
    var self = this.chain();
    var query = self.query;
    
    return new Promise(function(onFulfilled, onRejected){
            
      self.callInterceptors('beforeFind', self, [query], function(okay){
        if(okay){        
        
          query.exec(function(err, resp) { 
            if(err){
              throw new Store.SQLError(err);
            }
                    
            var data = {
              sql: query.toString(),
              result: resp
            };
          

            //console.log(query.toString()); 
            //console.log(query.toString(), resp);  
          
            self.callInterceptors('afterFind', self, [data], function(okay){
              onFulfilled(okay ? data.result : null);
            });
          });   
        
        }else{
          onFulfilled();
        }
      });
    }).bind(self);
    
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