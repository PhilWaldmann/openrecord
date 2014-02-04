/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var exists = config ? (config.__exists === true) :false;
    
    Object.defineProperty(this, '__exists', {enumerable: false, writable: false, value: exists}); 
  },
  
  
  save: function(options, callback){
    
    if(typeof options == 'function'){
      callback = options;
      options = {};
    }
    
    this.validate(function(valid){
          
      if(valid){
        this._create_or_update(options, callback);      
      }else{
        callback(false);
      }
      
    });
        
    return this;
  },
  
  
  
  
  
  
  _transaction: function(options, callback){
    if(options.transaction){
      options.commit = false;
      callback(options.transaction);
    }else{
       this.definition.store.connection.transaction(function(transaction){
         callback(transaction);
       });
    }
  },
  
  
  
  _create_or_update: function(options, callback){
    var self = this;
    
    this._transaction(options, function(transaction){
      options.transaction = transaction;
      if(self.__exists){
        self._update(options, callback);
      }else{
        self._create(options, callback);
      }
    });
  },
  
  
  
  
  _update: function(options, callback){
    var self = this;
    var query = this.definition.query();
    var primary_keys = this.definition.primary_keys;  
    var condition = {};
          
    for(var i = 0; i < primary_keys.length; i++){
      condition[primary_keys[i]] = this[primary_keys[i]];
    }
  
    query.transacting(options.transaction).where(condition).update(this.changes).exec(function(err, result){
      if(err) self.definition.emit('error', err); //TODO: Error Handling
      console.log(result);
      callback(err == null);
    });
  },
  
  
  
  
  
  _create: function(options, callback){
    var self = this;
    var query = this.definition.query();
    //TODO multiple primary keys?!?!
    var primary_keys = this.definition.primary_keys;  
    var primary_key = primary_keys[0];
    
    this.callInterceptors('beforeCreate', [options.transaction], function(okay){
      if(okay){        

        query.transacting(options.transaction).returning(primary_key).insert(self.attributes).exec(function(err, result){
          if(err){
            throw new Error(err); //TODO Error handling
          }
        
          self[primary_key] = result[0];
        
          self.callInterceptors('afterCreate', [self, options.transaction], function(okay){
            if(okay){
              
              if(options.commit !== false){
                options.transaction.commit();
              }
              
              callback(true);
            }else{
              options.transaction.rollback();
              callback(false);
            }  
          });
        });  

      }else{
        options.transaction.rollback();
        callback(false);
      }
    });
    
  }
};

