var async = require('async');
var Store = require('../../store');

/*
 * RECORD
 */
exports.record = {
  
  
  /**
   * Destroy a record
   * @section Record
   * @method destroy
   * @param {function} callback - The destroy callback
   *
   * @callback
   * @param {boolean} result - will be true if the destroy was successful
   * @this Record
   *
   * @return {Record}
   */
  destroy: function(options, callback){
    var self = this;
    var query = this.definition.query();
    var primary_keys = this.definition.primary_keys;  
    var condition = {};
          
    if(typeof options == 'function'){
      callback = options;
      options = null;
    }
        
    //promises
    if(!callback){
      this.setInternal('promise_target', 'destroy');
      return this;
    }
    self.running();
    
    
    options = options || {};
    callback = callback.bind(this); 
          
    for(var i = 0; i < primary_keys.length; i++){
      condition[primary_keys[i]] = this[primary_keys[i]];
    }
    

    this.transaction(options, function(){

      self.callInterceptors('beforeDestroy', [self, options.transaction], function(okay){
        if(okay){
          query.transacting(options.transaction).where(condition).delete().exec(function(err){
            if(err){
              options.transaction.rollback('exception');
              return self.reject(new Store.SQLError(err));
            }
            
            self.callInterceptors('afterDestroy', [self, options.transaction], function(okay){
              if(okay){              
                if(options.commit !== false){
                  options.transaction.commit();
                  options.transaction_promise.then(function(){
                    callback(true);
                  });
                }else{
                  callback(true);
                }                
              }else{
                if(options.rollback !== false){
                  options.transaction.rollback('afterDestroy');
                }
                callback(false);
              }  
            });
          });  

        }else{
          if(options.rollback !== false){
            options.transaction.rollback('beforeDestroy');
          }
          callback(false);
        }
      });
      
    });
    
    return self;
  },
  
  
  
  
  
  
  
  
  
  
  /**
   * Deletes the record. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   * @section Record
   * @method delete
   * @param {function} callback - The delete callback
   *
   * @callback
   * @param {boolean} result - will be true if the delete was successful
   * @this Record
   *
   * @return {Record}
   */
  'delete': function(options, callback){
    var self = this;
    var query = this.definition.query();
    var primary_keys = this.definition.primary_keys;  
    var condition = {};
          
    if(typeof options == 'function'){
      callback = options;
      options = null;
    }
    
    //promises
    if(!callback){
      this.setInternal('promise_target', 'delete');
      return this;
    }
    self.running();
    
    options = options || {};
    callback = callback.bind(this);  
          
    for(var i = 0; i < primary_keys.length; i++){
      condition[primary_keys[i]] = this[primary_keys[i]];
    }
    
    if(options.transaction){
      query.transacting(options.transaction);
    }
    
    query.where(condition).delete().exec(function(err){
      if(err){
        callback(false);
        return self.reject(new Store.SQLError(err));
      }
      callback(true);
    });
    
    return self;
  }
  
};




/*
 * MODEL
 */
exports.model = {
  
  /**
   * Deletes all records which match the conditions. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   * @section Model
   * @method deleteAll
   * @alias delete
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @param {integer} affected_records - The number of affected records
   * @this Collection
   *
   * @return {Model}
   */
  'delete': function(options, callback){
    return this.deleteAll(options, callback);
  },
  deleteAll: function(options, callback){
    var self = this.chain();
    
    if(typeof options == 'function'){
      callback = options;
      options = null;
    }
    
    //promises
    if(!callback){
      this.setInternal('promise_target', 'deleteAll');
      return this;
    }
    self.running();
    
    
    callback = callback.bind(self);
    
    var query = self.query;
    
    if(options && options.transaction){
      query.transacting(options.transaction);
    }
        
    self.callInterceptors('beforeFind', self, [query], function(okay){
      if(okay){        

        query.delete().exec(function(err, resp) { 

          if(err){
            return self.reject(new Store.SQLError(err));
          }
          
          callback(true, resp);
          
        });
      }else{
        callback(false, 0);
      }
    });
  
    return self;
  },
  
  
  
  
  
  /**
   * Loads all records at first and calls destroy on every single record. All hooks are fired and relations will be deleted if configured via options `dependent`
   * @section Model
   * @method destroyAll
   * @alias destroy
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @param {integer} affected_records - The number of affected records
   * @this Collection
   *
   * @return {Model}
   */
  destroy: function(options, callback){
    return this.destroyAll(options, callback);
  },
  destroyAll: function(options, callback){
    var self = this.chain();
    
    if(typeof options == 'function'){
      callback = options;
      options = null;
    }
    
    //promises
    if(!callback){
      this.setInternal('promise_target', 'destroyAll');
      return this;
    }
    self.running();
        
    callback = callback.bind(self);

    if(options && options.transaction){
      self.transaction(options.transaction);
    }

    self.exec(function(records){
      var tmp = [];
      var affected = 0;    
      
      self.each(function(record){
        tmp.push(function(next){
          record.destroy(options, function(success){
            if(success) affected+=1;
            next();
          });
        });
      });
      
      if(tmp.length == 0){
        return callback(true, 0);
      }
      
      async.series(tmp, function(){
        callback(true, affected);
      });
    });
  
    return self;
  }
};
