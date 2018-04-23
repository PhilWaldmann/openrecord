const debug = require('debug')('openrecord:save')

/*
 * RECORD
 */
exports.record = {
  _create_or_update: function() {
    var self = this

    var options = self.definition.store.utils.clone(
      self.definition.actions[self.__exists ? 'update' : 'create']
    )

    return self
      .callInterceptors('beforeSave', [self, options])
      .then(function() {
        if (self.__exists) {
          return self._update(options)
        } else {
          return self._create(options)
        }
      })
      .then(function() {
        return self.callInterceptors('afterSave', [self, options])
      })
  },

  _update: function(options) {
    var self = this
    var primaryKeys = this.definition.primaryKeys

    for (var i = 0; i < primaryKeys.length; i++) {
      options.params[primaryKeys[i]] = this[primaryKeys[i]]
    }

    self.definition.store.utils.applyParams(options)

    return this.callInterceptors('beforeUpdate', [self, options])
      .then(function() {
        var values = {}
        var changes = self.getChangedValues()

        for (var name in self.model.definition.attributes) {
          var attr = self.model.definition.attributes[name]

          if (attr.persistent !== false && changes.hasOwnProperty(name)) {
            values[name] = changes[name]
          }
        }

        var data = self.definition.store.utils.clone(options.params)
        data.data = values // TODO: data param configurable

        // TODO: has_changes?!?!?!
        return self.model.definition.store.connection.put(options.url, data)
      })
      .then(function(result) {
        debug('put ' + options.url)
        // var validationErrors = obj[self.errorParam || 'error']
        // if(typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0){
        //   self.errors.set(validationErrors)
        //   return resolve(false)
        // }

        var data = result.data[this.rootParam || 'data']

        if (data) {
          self.set(data)
        }

        return self.callInterceptors('afterUpdate', [self, options])
      })
  },

  _create: function(options) {
    var self = this

    return this.callInterceptors('beforeCreate', [self, options])
      .then(function() {
        var values = {}
        var changes = self.getChangedValues()

        for (var name in self.model.definition.attributes) {
          var attr = self.model.definition.attributes[name]

          if (attr.persistent !== false && changes.hasOwnProperty(name)) {
            values[name] = changes[name]
          }
        }

        var data = self.definition.store.utils.clone(options.params)
        data.data = values // TODO: data param configurable

        return self.model.definition.store.connection.post(options.url, data)
      })
      .then(function(result) {
        debug('post ' + options.url)
        //
        // var validationErrors = obj[self.errorParam || 'error']
        // if(typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0){
        //   self.errors.set(validationErrors)
        //   return resolve(false)
        // }

        var data = result.data[this.rootParam || 'data']

        if (data) {
          self.set(data)
        }

        self._exists({ relations: false, changes: false })

        return self.callInterceptors('afterCreate', [self, options])
      })
  }
}
