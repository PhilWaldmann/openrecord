const ldap = require('ldapjs')


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
    var self = this

    return self.promise(function(resolve, reject){
      self.validate(function(valid){
        if(valid){
          self._create_or_update(resolve, reject)
        }else{
          resolve(false)
        }
      })
    }, resolve, reject)
  },




  _create_or_update: function(resolve, reject){
    var self = this

    var options = {}

    self.callInterceptors('beforeSave', [self, options], function(okay){
      if(okay){
        if(self.__exists){
          self._update(options, resolve, reject)
        }else{
          self._create(options, resolve, reject)
        }
      }else{
        resolve(false)
      }
    }, reject)
  },




  _update: function(options, resolve, reject){
    const Utils = this.definition.store.utils
    var self = this

    this.callInterceptors('beforeUpdate', [self, options], function(okay){
      if(okay){
        var values = []
        var changes = self.getChangedValues()
        var hasChanges = false
        var moveFrom
        var dn = self.dn
        var tmp

        for(var name in self.definition.attributes){ // TODO: put this junk of code into a general function...
          var attr = self.definition.attributes[name]

          if(attr.persistent !== false && changes.hasOwnProperty(name)){
            if(name === 'dn'){
              moveFrom = self.getChanges()[name][0]
            }else{
              hasChanges = true

              var value = self.definition.cast(name, changes[name], 'write', self)
              var oldValue = self.definition.cast(name, self.changes[name][0], 'write', self)

              if(value instanceof Array || oldValue instanceof Array){
                var addedValues = Utils.addedArrayValues(oldValue, value)
                var removedValues = Utils.removedArrayValues(oldValue, value)

                if(addedValues.length > 0){
                  tmp = {}
                  tmp[name] = addedValues

                  values.push(new ldap.Change({
                    operation: 'add',
                    modification: tmp
                  }))
                }


                if(removedValues.length > 0){
                  tmp = {}
                  tmp[name] = removedValues

                  values.push(new ldap.Change({
                    operation: 'delete',
                    modification: tmp
                  }))
                }
              }else{
                tmp = {}
                var operation = 'replace'

                if(value === null || value === ''){
                  if(oldValue === null || oldValue === ''){
                    operation = null
                  }else{
                    operation = 'delete'
                    tmp[name] = oldValue
                  }
                }else{
                  tmp[name] = value
                }

                if(operation){
                  values.push(new ldap.Change({
                    operation: operation,
                    modification: tmp
                  }))
                }
              }
            }
          }
        }

        var saveChanges = function(){
          if(!hasChanges || values.length === 0) return resolve(true)

          self.model.definition.store.connection.modify(dn, values, function(err){
            if(err){
              err = self.definition.store.convertLdapErrorToValidationError(self, err)
              if(err) return reject(err)
              return resolve(false)
            }

            self.callInterceptors('afterUpdate', [self, options], function(okay){
              if(okay){
                self.callInterceptors('afterSave', [self, options], function(okay){
                  resolve(okay)
                })
              }else{
                resolve(false)
              }
            })
          })
        }


        var move = function(callback){
          self.model.definition.store.connection.modifyDN(moveFrom, dn, function(err){
            if(err){
              err = self.definition.store.convertLdapErrorToValidationError(self, err)
              if(err) return reject(err)
              return resolve(false)
            }
            callback()
          })
        }


        if(moveFrom){
          move(saveChanges)
        }else{
          saveChanges()
        }
      }else{
        resolve(false)
      }
    }, reject)
  },





  _create: function(options, resolve, reject){
    var self = this

    this.callInterceptors('beforeCreate', [self, options], function(okay){
      if(okay){
        var values = {}
        var changes = self.getChangedValues()
        var dn = self.dn

        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name]
          var val = self.model.definition.cast(name, changes[name], 'write', self)
          if(attr.persistent !== false && changes.hasOwnProperty(name) && name !== 'dn' && val !== null && val !== '' && (!Array.isArray(val) || val.length > 0)){
            values[name] = val
          }
        }

        values.objectClass = self.definition.getName()
        if(!dn){
          self.errors.add('dn', 'not valid') // TODO: in validation, but sometimes the dn is set via the parent ou...
          return resolve(false)
        }

        self.model.definition.store.connection.add(dn, values, function(err){
          if(err){
            err = self.definition.store.convertLdapErrorToValidationError(self, err)
            if(err) return reject(err)
            return resolve(false)
          }

          self.__exists = true

          self.callInterceptors('afterCreate', [self, options], function(okay){
            if(okay){
              self.callInterceptors('afterSave', [self, options], function(okay){
                resolve(okay)
              })
            }else{
              resolve(false)
            }
          })
        })
      }else{
        resolve(false)
      }
    }, reject)
  }
}
