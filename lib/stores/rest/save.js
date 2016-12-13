var Store = require('../../store');
var Utils = require('../../utils');


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

    var options = Utils.clone(self.definition.actions[self.__exists ? 'update' : 'create']);

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
    var primary_keys = this.definition.primary_keys;

    for(var i = 0; i < primary_keys.length; i++){
      options.params[primary_keys[i]] = this[primary_keys[i]];
    }

    Utils.applyParams(options);


    this.callInterceptors('beforeUpdate', [self, options], function(okay){
      if(okay){

        var values = {};
        var changes = self.getChangedValues();
        var has_changes = false;

        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name];

          if(attr.persistent !== false && changes.hasOwnProperty(name)){
            values[name] = changes[name];
            has_changes = true;
          }
        }

        var data = Utils.clone(options.params);
        data.data = values; //TODO: data param configurable


        //TODO: has_changes?!?!?!
        self.model.definition.store.connection.put(options.path, data, function(err, req, res, obj){

          if(err){
            return reject(err);
          }

          var validation_errors = obj[self.errorParam || 'error'];
          if(typeof validation_errors === 'object' && Object.keys(validation_errors).length > 0){
            self.errors.set(validation_errors);
            return resolve(false);
          }


          var data = obj[this.rootParam || 'data'];

          if(data){
            self.set(data);
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

        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name];

          if(attr.persistent !== false && changes.hasOwnProperty(name)){
            values[name] = changes[name];
          }
        }

        var data = Utils.clone(options.params);
        data.data = values; //TODO: data param configurable

        self.model.definition.store.connection.post(options.path, data, function(err, req, res, obj){

          if(err){
            return reject(err);
          }

          var validation_errors = obj[self.errorParam || 'error'];
          if(typeof validation_errors === 'object' && Object.keys(validation_errors).length > 0){
            self.errors.set(validation_errors);
            return resolve(false);
          }


          var data = obj[this.rootParam || 'data'];

          if(data){
            self.set(data);
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
