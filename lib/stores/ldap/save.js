var util = require('util');
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

            if(name === 'dn'){
              move_from = self.getChanges()[name][0];
            }else{
              has_changes = true;

              var value = attr.type.cast.write.call(self, changes[name]);
              var old_value = attr.type.cast.write.call(self, self.changes[name][0]);

              if(value instanceof Array || old_value instanceof Array){
                var added_values = Utils.addedArrayValues(old_value, value);
                var removed_values = Utils.removedArrayValues(old_value, value);

                if(added_values.length > 0){
                  var tmp = {};
                  tmp[name] = added_values;

                  values.push(new ldap.Change({
                    operation: 'add',
                    modification: tmp
                  }));
                }


                if(removed_values.length > 0){
                  var tmp = {};
                  tmp[name] = removed_values;

                  values.push(new ldap.Change({
                    operation: 'delete',
                    modification: tmp
                  }));
                }


              }else{
                var tmp = {};
                var operation = 'replace';

                if(value === null || value === ''){
                  if(old_value === null || old_value === ''){
                    operation = null;
                  }else{
                    operation = 'delete';
                    tmp[name] = old_value;
                  }
                }else{
                  tmp[name] = value;
                }

                if(operation){
                  values.push(new ldap.Change({
                    operation: operation,
                    modification: tmp
                  }));
                }
              }
            }
          }
        }

        var saveChanges = function(){
          if(!has_changes || values.length === 0) return resolve(true);

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
          var val = attr.type.cast.write.call(self, changes[name]);
          if(attr.persistent !== false && changes.hasOwnProperty(name) && name !== 'dn' && val !== null && val !== '' && (!util.isArray(val) || val.length > 0)){
            values[name] = val;
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
