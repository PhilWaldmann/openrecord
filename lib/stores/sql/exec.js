var Store = require('../../store');
var Promise = require('bluebird');

/*
 * MODEL
 */
exports.model = {
  /**
   * Executes the find
   *
   * @class Model
   * @method exec
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   */
  exec: function(resolve, reject){
    var self = this.chain();
    var query = self.query;

    return self.promise(function(resolve, reject){
      var as_raw = self.getInternal('as_raw');

      self.callInterceptors('beforeFind', self, [query], function(okay){
        if(okay){        

          query.exec(function(err, resp) { 
            self.logger.info(query.toString()); 
            
            if(err){
              return reject(new Store.SQLError(err));
            }
          
            var data = {
              sql: query.toString(),
              result: resp
            };
          

            
            self.logger.trace(resp);  
          
            if(as_raw){
              resolve(data.result);
            }else{
              self.callInterceptors('afterFind', self, [data], function(okay){
                if(okay){
                  resolve(data.result);              
                }else{
                  resolve(null);
                }
              }, reject);
            }          
            
          });   
        
        }else{
          resolve(null);
        }
      }, reject);
    }, resolve, reject);
  },
  
  
  
  toSql: function(){
    var sql;
    var query = this.query;
        
    //make async?
    this.callInterceptors('beforeFind', this, [query], function(){
      sql = query.toString();
    });
    
    return sql.replace(/`/g, '\"');
  },
  
  
  /**
   * `exec()` will return the raw store output
   * Be aware, that no `afterFind` hook will be fired if you use `asRaw()`.
   *
   * @class Model
   * @method asRaw
   *
   * @return {Model}
   * @see Model.exec()
   */
  asRaw: function(){
    var self = this.chain();
    
    self.setInternal('as_raw', true);
      
    return self;
  }
  
};