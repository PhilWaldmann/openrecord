/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var exists = config ? (config.__exists === true) :false;
    
    Object.defineProperty(this, '__exists', {enumerable: false, writable: true, value: exists});
    if(exists){
      this.resetChanges();
    }
  },
  
  
  save: function(options, callback){
    
    if(typeof options == 'function'){
      callback = options;
      options = {};
    }
    
    callback = callback.bind(this);
    
    this.validate(function(valid){
          
      if(valid){
        this._create_or_update(options, callback);      
      }else{
        callback(false);
      }
      
    });
        
    return this;
  },
  
    
  
  
  _create_or_update: function(options, callback){
    var self = this;
    
    
    this.transaction(options, function(transaction){
      self.callInterceptors('beforeSave', [transaction], function(okay){
        if(okay){
          if(self.__exists){
            self._update(options, callback);
          }else{
            self._create(options, callback);
          }
        }else{
          callback(false);
        }        
      });
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
  
    if(!this.hasChanges()){
      if(options.commit !== false){
        options.transaction.commit();
      }
      return callback(true);
    }


    this.callInterceptors('beforeUpdate', [options.transaction], function(okay){
      if(okay){        

        query.transacting(options.transaction).where(condition).update(self.getChangedValues()).exec(function(err, result){
          if(err){
            throw new Error(err); //TODO Error handling
          }
                
          self.callInterceptors('afterUpdate', [self, options.transaction], function(okay){
            if(okay){

              self.callInterceptors('afterSave', [self, options.transaction], function(okay){
                
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
              self.callInterceptors('afterSave', [self, options.transaction], function(okay){
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

