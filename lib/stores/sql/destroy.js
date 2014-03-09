var async = require('async');
var Store = require('../../store');

/*
 * RECORD
 */
exports.record = {
  
  
  /**
   * Destroy a record
   * @area Record
   * @method destroy
   * @param {function} callback - The destroy callback
   *
   * @callback
   * @param {boolean} result - will be true if the destroy was successful
   * @scope Record
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
          
    options = options || {};
    callback = callback.bind(this); 
          
    for(var i = 0; i < primary_keys.length; i++){
      condition[primary_keys[i]] = this[primary_keys[i]];
    }
    

    this.transaction(options, function(){

      self.callInterceptors('beforeDestroy', [options.transaction], function(okay){
        if(okay){
          query.transacting(options.transaction).where(condition).delete().exec(function(err){
            if(err){
              options.transaction.rollback('exception'); //TODO!
              return self.handleException(new Store.SQLError(err));
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
   * @area Record
   * @method delete
   * @param {function} callback - The delete callback
   *
   * @callback
   * @param {boolean} result - will be true if the delete was successful
   * @scope Record
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
        return self.handleException(new Store.SQLError(err));
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
   * @area Model
   * @method delete_all
   * @alias delete
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @param {integer} affected_records - The number of affected records
   * @scope Collection
   *
   * @return {Model}
   */
  'delete': function(options, callback){
    return this.delete_all(options, callback);
  },
  delete_all: function(options, callback){
    var self = this.chain();
    
    if(typeof options == 'function'){
      callback = options;
      options = null;
    }
    
    callback = callback.bind(self);
    
    var query = self.query;
    
    if(options && options.transaction){
      query.transacting(options.transaction);
    }
        
    self.callInterceptors('beforeFind', self, [query], function(okay){
      if(okay){        

        query.delete().exec(function(err, resp) { 

          if(err){
            throw new Error(err); //TODO Error handling
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
   * @area Model
   * @method destroy_all
   * @alias destroy
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @param {integer} affected_records - The number of affected records
   * @scope Collection
   *
   * @return {Model}
   */
  destroy: function(options, callback){
    return this.destroy_all(options, callback);
  },
  destroy_all: function(options, callback){
    var self = this.chain();
    
    if(typeof options == 'function'){
      callback = options;
      options = null;
    }
    
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
