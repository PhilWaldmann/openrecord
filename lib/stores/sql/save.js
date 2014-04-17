var Store = require('../../store');


/*
 * RECORD
 */
exports.record = {

  /**
   * Save the current record
   * @section Record
   * @method save
   * @param {function} callback - The save callback
   *
   * @callback
   * @param {boolean} result - will be true if the save was successful
   * @this Record
   *
   * @return {Record}
   */
  save: function(options, resolve, reject){
    var self = this;
    
    if(typeof options == 'function'){
      reject = resolve;
      resolve = options;      
      options = {};
    }
        
    options = options || {};
    
    //callback = callback.bind(this);
    
    return self.promise(function(resolve, reject){
      
      self.callInterceptors('beforeValidation', [self], function(okay){
        if(okay){
          self.validate(function(valid){
          
            self.callInterceptors('afterValidation', [self, valid], function(okay){
              if(okay){
                if(valid){
                  self._create_or_update(options, resolve, reject);      
                }else{
                  resolve(false);
                }
              }else{
                resolve(false);
              }
            });
      
          });
        }else{
          resolve(false);
        }
      });
      
    }, resolve, reject);
  },
  
    
  
  
  _create_or_update: function(options, resolve, reject){
    var self = this;
    
    this.transaction(options, function(transaction){
      self.callInterceptors('beforeSave', [self, transaction], function(okay){
        if(okay){
          if(self.__exists){
            self._update(options, resolve, reject);
          }else{
            self._create(options, resolve, reject);
          }
        }else{
          if(options.rollback !== false){
            transaction.rollback('beforeSave');
          }
          resolve(false);
        }        
      });
    });
  },
  
  
  
  
  _update: function(options, resolve, reject){
    var self = this;
    var query = this.definition.query();
    var primary_keys = this.definition.primary_keys;  
    var condition = {};
          
    for(var i = 0; i < primary_keys.length; i++){
      condition[primary_keys[i]] = this[primary_keys[i]];
    }
  

    this.callInterceptors('beforeUpdate', [self, options.transaction], function(okay){
      if(okay){        

        var values = {};
        var changes = self.getChangedValues();
        var has_changes = false;
                
        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name];

          if(attr.persistent && changes.hasOwnProperty(name)){
            values[name] = changes[name];
            has_changes = true;
          }
        }
        
        var afterUpdate = function(){
          self.callInterceptors('afterUpdate', [self, options.transaction], function(okay){
            if(okay){

              self.callInterceptors('afterSave', [self, options.transaction], function(okay){
                
                if(okay){
                  if(options.commit !== false){
                    options.transaction.commit();
                    options.transaction_promise.then(function(){
                      resolve(true);
                    });
                  }else{
                    resolve(true);
                  }
                }else{
                  if(options.rollback !== false){
                    options.transaction.rollback('afterSave');
                  }
                  resolve(false);
                }
                
              });
              
            }else{
              if(options.rollback !== false){
                options.transaction.rollback('afterUpdate');
              }
              resolve(false);
            }  
          });
        };

        if(has_changes){          
          query.transacting(options.transaction).where(condition).update(values).exec(function(err, result){
            if(err){
              options.transaction.rollback('exception');
              return reject(new Store.SQLError(err));
            }          
            afterUpdate();          
          });  
        }else{
          //call afterUpdate hook even there was nothing to save for the current record!
          afterUpdate();
        }

        

      }else{
        if(options.rollback !== false){
          options.transaction.rollback('beforeUpdate');
        }
        resolve(false);
      }
    });

  },
  
  
  
  
  
  _create: function(options, resolve, reject){
    var self = this;
    var query = this.definition.query();
    //TODO multiple primary keys?!?!
    var primary_keys = this.definition.primary_keys;  
    var primary_key = primary_keys[0];

    this.callInterceptors('beforeCreate', [self, options.transaction], function(okay){
      if(okay){        

        var values = {};
        var changes = self.getChangedValues();
                
        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name];

          if(attr.persistent && changes.hasOwnProperty(name)){
            values[name] = changes[name];
          }
        }        
        

        query.transacting(options.transaction).returning(primary_key).insert(values).exec(function(err, result){
          if(err){
            options.transaction.rollback('exception'); //TODO!
            return reject(new Store.SQLError(err));
          }
        
          self[primary_key] = result[0];
          self.__exists = true;
          
          self.callInterceptors('afterCreate', [self, options.transaction], function(okay){
            if(okay){
              self.callInterceptors('afterSave', [self, options.transaction], function(okay){
                if(okay){
                  if(options.commit !== false){
                    options.transaction.commit();
                    options.transaction_promise.then(function(){
                      resolve(true);
                    });
                  }else{
                    resolve(true);
                  }
                }else{
                  if(options.rollback !== false){
                    options.transaction.rollback('afterSave');
                  }
                  resolve(false);
                }
                
              });
            }else{
              if(options.rollback !== false){
                options.transaction.rollback('afterCreate');
              }
              resolve(false);
            }  
          });
        });  

      }else{
        if(options.rollback !== false){
          options.transaction.rollback('beforeCreate');
        }
        resolve(false);
      }
    });
    
  }
};




exports.model = {
  /**
   * Updates all records which match the conditions. beforeSave, afterSave, beforeUpdate and afterUpdate want be called!
   * @section Model
   * @method updateAll
   * @alias update
   *
   * @callback
   * @param {boolean} success - Returns true if the update was successfull
   * @param {integer} affected_records - The number of affected records
   * @this Collection
   *
   * @return {Model}
   */
  update: function(attributes, options, callback){
    return this.updateAll(attributes, options, callback);
  },
  updateAll: function(attributes, options, callback){
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

        query.update(attributes).exec(function(err, resp) { 

          if(err){
            throw new Error(err); //TODO Error handling
          }else{
            callback(true);
          }
          
        });
      }else{
        callback(false, 0);
      }
    });
  
    return self;
  }
}
