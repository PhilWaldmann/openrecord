/*
 * MODEL
 */
exports.model = {
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
  _find: function(callback){
    var self = this.chain();
    var query = self.query;
        
    console.log('>', require('util').inspect(callback, {depth: 2}));    
    
    //TODO make it nicer
    self.callInterceptors('beforeFind', self, [query], function(okay){
      if(okay){        
        
        query.exec(function(err, resp) { 
          if(err){
            self.handleException(new Store.SQLError(err));
          }
                    
          var data = {
            sql: query.toString(),
            result: resp
          };
          

          //console.log(query.toString()); 
          //console.log(query.toString(), resp);  
          
          self.callInterceptors('afterFind', self, [data], function(okay){
            callback(okay ? data.result : null);
          });
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
        
    //make async?
    this.callInterceptors('beforeFind', this, [query], function(){
      sql = query.toString();
    });
    
    return sql;
  }
  
};