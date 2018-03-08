
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

    var options = self.definition.store.utils.clone(self.definition.actions[self.__exists ? 'update' : 'create'])

    return self.callInterceptors('beforeSave', [self, options])
    .then(function(){
      if(self.__exists){
        return self._update(options)
      }else{
        return self._create(options)
      }
    })
    .then(function(){
      return self.callInterceptors('afterSave', [self, options])
    })
  },




  _update: function(options){
    var self = this
    var primaryKeys = this.definition.primaryKeys

    for(var i = 0; i < primaryKeys.length; i++){
      options.params[primaryKeys[i]] = this[primaryKeys[i]]
    }

    self.definition.store.utils.applyParams(options)


    return this.callInterceptors('beforeUpdate', [self, options])
    .then(function(){
      var values = {}
      var changes = self.getChangedValues()

      for(var name in self.model.definition.attributes){
        var attr = self.model.definition.attributes[name]

        if(attr.persistent !== false && changes.hasOwnProperty(name)){
          values[name] = changes[name]
        }
      }

      var data = self.definition.store.utils.clone(options.params)
      data.data = values // TODO: data param configurable


      // TODO: has_changes?!?!?!
      return self.model.definition.store.connection.put(options.url, data)
    })
    .then(function(result){
      self.logger.info('put ' + options.url)
      // var validationErrors = obj[self.errorParam || 'error']
      // if(typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0){
      //   self.errors.set(validationErrors)
      //   return resolve(false)
      // }

      var data = result.data[this.rootParam || 'data']

      if(data){
        self.set(data)
      }


      return self.callInterceptors('afterUpdate', [self, options])
    })
  },





  _create: function(options){
    var self = this

    return this.callInterceptors('beforeCreate', [self, options])
    .then(function(){
      var values = {}
      var changes = self.getChangedValues()

      for(var name in self.model.definition.attributes){
        var attr = self.model.definition.attributes[name]

        if(attr.persistent !== false && changes.hasOwnProperty(name)){
          values[name] = changes[name]
        }
      }

      var data = self.definition.store.utils.clone(options.params)
      data.data = values // TODO: data param configurable

      return self.model.definition.store.connection.post(options.url, data)
    })
    .then(function(result){
      self.logger.info('post ' + options.url)
      //
      // var validationErrors = obj[self.errorParam || 'error']
      // if(typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0){
      //   self.errors.set(validationErrors)
      //   return resolve(false)
      // }


      var data = result.data[this.rootParam || 'data']

      if(data){
        self.set(data)
      }

      self.__exists = true

      return self.callInterceptors('afterCreate', [self, options])
    })
  }
}
