const debug = require('debug')('openrecord:save')
const ldap = require('ldapjs')

/*
 * RECORD
 */
exports.record = {
  _create_or_update: function() {
    var self = this

    var options = {}

    return self
      .callInterceptors('beforeSave', [self, options])
      .then(function() {
        if (self.__exists) {
          return self._update(options)
        } else {
          return self._create(options)
        }
      })
  },

  _update: function(options) {
    const Utils = this.definition.store.utils
    var self = this

    return this.callInterceptors('beforeUpdate', [self, options]).then(
      function() {
        var values = []
        var changes = self.getChangedValues()
        var hasChanges = false
        var moveFrom
        var dn = self.dn
        var tmp

        for (var name in self.definition.attributes) {
          // TODO: refactor code in V2.1
          var attr = self.definition.attributes[name]

          if (attr.persistent !== false && changes.hasOwnProperty(name)) {
            if (name === 'dn') {
              moveFrom = self.getChanges()[name][0]
            } else {
              hasChanges = true

              var value = self.definition.cast(
                name,
                changes[name],
                'write',
                self
              )
              var oldValue = self.definition.cast(
                name,
                self.changes[name][0],
                'write',
                self
              )

              if (value instanceof Array || oldValue instanceof Array) {
                var addedValues = Utils.addedArrayValues(oldValue, value)
                var removedValues = Utils.removedArrayValues(oldValue, value)

                if (addedValues.length > 0) {
                  tmp = {}
                  tmp[name] = addedValues

                  values.push(
                    new ldap.Change({
                      operation: 'add',
                      modification: tmp
                    })
                  )
                }

                if (removedValues.length > 0) {
                  tmp = {}
                  tmp[name] = removedValues

                  values.push(
                    new ldap.Change({
                      operation: 'delete',
                      modification: tmp
                    })
                  )
                }
              } else {
                tmp = {}
                var operation = 'replace'

                if (value === null || value === '') {
                  if (oldValue === null || oldValue === '') {
                    operation = null
                  } else {
                    operation = 'delete'
                    tmp[name] = oldValue
                  }
                } else {
                  tmp[name] = value
                }

                if (operation) {
                  values.push(
                    new ldap.Change({
                      operation: operation,
                      modification: tmp
                    })
                  )
                }
              }
            }
          }
        }

        var saveChanges = function(resolve, reject) {
          if (!hasChanges || values.length === 0) return resolve()

          self.model.definition.store.connection.modify(dn, values, function(
            err
          ) {
            debug('Update ' + dn + ' Values=' + JSON.stringify(values))
            if (err)
              return reject(
                self.definition.store.convertLdapErrorToValidationError(
                  self,
                  err
                )
              )

            resolve(
              self
                .callInterceptors('afterUpdate', [self, options])
                .then(function() {
                  return self.callInterceptors('afterSave', [self, options])
                })
            )
          })
        }

        var move = function(resolve, reject) {
          self.model.definition.store.connection.modifyDN(
            moveFrom,
            dn,
            function(err) {
              if (err)
                return reject(
                  self.definition.store.convertLdapErrorToValidationError(
                    self,
                    err
                  )
                )
              saveChanges(resolve, reject)
            }
          )
        }

        if (moveFrom) {
          return new Promise(move)
        } else {
          return new Promise(saveChanges)
        }
      }
    )
  },

  _create: function(options) {
    var self = this

    return this.callInterceptors('beforeCreate', [self, options]).then(
      function() {
        var values = {}
        var changes = self.getChangedValues()
        var dn = self.dn

        for (var name in self.model.definition.attributes) {
          var attr = self.model.definition.attributes[name]
          var val = self.model.definition.cast(
            name,
            changes[name],
            'write',
            self
          )
          if (
            attr.persistent !== false &&
            changes.hasOwnProperty(name) &&
            name !== 'dn' &&
            val !== null &&
            val !== '' &&
            (!Array.isArray(val) || val.length > 0)
          ) {
            values[name] = val
          }
        }

        values.objectClass = self.definition.getName()
        if (!dn) {
          self.errors.add('dn', 'not valid')
          throw self.errors
        }

        return new Promise(function(resolve, reject) {
          self.model.definition.store.connection.add(dn, values, function(err) {
            debug('Create ' + dn + ' Values=' + JSON.stringify(values))

            if (err)
              return reject(
                self.definition.store.convertLdapErrorToValidationError(
                  self,
                  err
                )
              )

            self._exists({ relations: false, changes: false })

            resolve(
              self
                .callInterceptors('afterCreate', [self, options])
                .then(function() {
                  return self.callInterceptors('afterSave', [self, options])
                })
            )
          })
        })
      }
    )
  }
}
