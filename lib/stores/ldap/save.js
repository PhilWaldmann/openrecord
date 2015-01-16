var Store = require('../../store');
var Utils = require('../../utils');
var ldap  = require('ldapjs');


/*
 * RECORD
 */
exports.record = {

  /**
   * Save the current record
   * @class Record
   * @method save
   * @param {function} callback - The save callback
   *
   * @callback
   * @param {boolean} result - will be true if the save was successful
   * @this Record
   *
   * @return {Record}
   */
  save: function(resolve, reject){
    var self = this;
       
    return self.promise(function(resolve, reject){
      
      self.validate(function(valid){
      
        if(valid){
          self._create_or_update(resolve, reject);      
        }else{
          resolve(false);
        }
  
      });
      
    }, resolve, reject);
  },
  
    
  
  
  _create_or_update: function(resolve, reject){
    var self = this;
    
    var options = {};
    
    self.callInterceptors('beforeSave', [self, options], function(okay){
      if(okay){
        if(self.__exists){
          self._update(options, resolve, reject);
        }else{
          self._create(options, resolve, reject);
        }
      }else{
        resolve(false);
      }        
    }, reject);
  },
  
  
  
  
  _update: function(options, resolve, reject){
    var self = this;
    
    this.callInterceptors('beforeUpdate', [self, options], function(okay){
      if(okay){        

        var values = [];
        var changes = self.getChangedValues();
        var has_changes = false;
        var move_from;
        var dn = self.dn;
          
        for(var name in self.definition.attributes){ //TODO: put this junk of code into a general function...
          var attr = self.definition.attributes[name];

          if(attr.persistent !== false && changes.hasOwnProperty(name)){
            var value = attr.type.cast.write.call(self, changes[name]);
            var tmp = {};
            tmp[name] = value;
            
            if(name === 'dn'){
              move_from = self.getChanges()[name][0];
            }else{
              values.push(new ldap.Change({
                operation: 'replace',
                modification: tmp
              }));
              has_changes = true;
            }
          }
        }
        
        var saveChanges = function(){
          if(!has_changes) return resolve(true);
          
          self.model.definition.store.connection.modify(dn, values, function(err){
                    
            if(err){
              err = self.definition.store.convertLdapErrorToValidationError(self, err);
              if(err) return reject(err);
              return resolve(false);
            }
                         
            self.callInterceptors('afterUpdate', [self, options], function(okay){
              if(okay){

                self.callInterceptors('afterSave', [self, options], function(okay){   
                
                  resolve(okay);     
                                     
                });
            
              }else{
                resolve(false);
              }  
            });
          
          });
        }
        
        
        var move = function(callback){
          self.model.definition.store.connection.modifyDN(move_from, dn, function(err){
            if(err){
              err = self.definition.store.convertLdapErrorToValidationError(self, err);
              if(err) return reject(err);
              return resolve(false);
            }
            callback();
          });
        }
        

        if(move_from){
          move(saveChanges);
        }else{
          saveChanges();
        }

      }else{
        resolve(false);
      }
    }, reject);

  },
  
  
  
  
  
  _create: function(options, resolve, reject){
    var self = this;

    this.callInterceptors('beforeCreate', [self, options], function(okay){
      if(okay){        

        var values = {};
        var changes = self.getChangedValues();
        var dn = self.dn;
                
        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name];

          if(attr.persistent !== false && changes.hasOwnProperty(name) && name !== 'dn'){
            values[name] = attr.type.cast.write.call(self, changes[name]);
          }
        }        
        
        values.objectClass = self.definition.getName();
        if(!dn){
          self.errors.add('dn', 'not valid'); //TODO: in validation, but sometimes the dn is set via the parent ou...
          return resolve(false);
        }

        self.model.definition.store.connection.add(dn, values, function(err){

          if(err){
            err = self.definition.store.convertLdapErrorToValidationError(self, err);
            if(err) return reject(err);
            return resolve(false);
          }

          self.__exists = true;
          
          self.callInterceptors('afterCreate', [self, options], function(okay){
            if(okay){
              self.callInterceptors('afterSave', [self, options], function(okay){
                
                resolve(okay);
                                
              });
            }else{
              resolve(false);
            }  
          });
        });  

      }else{
        resolve(false);
      }
    }, reject);
    
  }
};
