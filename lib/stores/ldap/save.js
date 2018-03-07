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

    return self.validate()
    .then(function(){
      return self._create_or_update()
    })
    .then(function(){
      return self
    })
    .then(resolve, reject)
  },




  _create_or_update: function(){
    var self = this

    var options = {}

    return self.callInterceptors('beforeSave', [self, options])
    .then(function(){
      if(self.__exists){
        return self._update(options)
      }else{
        return self._create(options)
      }
    })
  },




  _update: function(options){
    const Utils = this.definition.store.utils
    var self = this

    return this.callInterceptors('beforeUpdate', [self, options])
    .then(function(){
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

      var saveChanges = function(resolve, reject){
        if(!hasChanges || values.length === 0) return resolve()

        self.model.definition.store.connection.modify(dn, values, function(err){
          if(err){
            err = self.definition.store.convertLdapErrorToValidationError(self, err)
            // TODO: Throw validation error
            return reject(err)
          }

          resolve(
            self.callInterceptors('afterUpdate', [self, options])
            .then(function(){
              return self.callInterceptors('afterSave', [self, options])
            })
          )
        })
      }


      var move = function(resolve, reject){
        self.model.definition.store.connection.modifyDN(moveFrom, dn, function(err){
          if(err){
            err = self.definition.store.convertLdapErrorToValidationError(self, err)
            // TODO: Throw validation error
            return reject(err)
          }
          saveChanges(resolve, reject)
        })
      }

      if(moveFrom){
        return new Promise(move)
      }else{
        return new Promise(saveChanges)
      }
    })
  },





  _create: function(options){
    var self = this

    return this.callInterceptors('beforeCreate', [self, options])
    .then(function(){
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
        throw self.errors
      }

      return new Promise(function(resolve, reject){
        self.model.definition.store.connection.add(dn, values, function(err){
          if(err){
            err = self.definition.store.convertLdapErrorToValidationError(self, err)
            // TODO: Throw validation error
            return reject(err)
          }

          self.__exists = true

          resolve(
            self.callInterceptors('afterCreate', [self, options])
            .then(function(){
              return self.callInterceptors('afterSave', [self, options])
            })
          )
        })
      })
    })
  }
}
