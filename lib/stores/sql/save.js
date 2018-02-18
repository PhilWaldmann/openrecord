
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
  save: function(options, resolve, reject){
    var self = this

    if(typeof options === 'function'){
      reject = resolve
      resolve = options
      options = {}
    }

    options = options || {}

    // callback = callback.bind(this);

    return self.validate()
    .then(function(){
      return self._create_or_update(options)
    })
    .then(function(){
      return self
    })
    .then(resolve, reject)
  },




  _create_or_update: function(options){
    var self = this

    return this.transaction(options, function(){
      return self.callInterceptors('beforeSave', [self, options])
      .then(function(){
        if(self.__exists) return self._update(options)
        return self._create(options)
      })
      .then(function(){
        return self.callInterceptors('afterSave', [self, options])
      })
      .then(function(){
        // eliminate changes -> we just saved it to the database!
        self.changes = {}
      })
    })
  },




  _update: function(options){
    const Store = require('../../store')

    var self = this
    var query = this.definition.query(options)
    var primaryKeys = this.definition.primary_keys
    var condition = {}

    for(var i = 0; i < primaryKeys.length; i++){
      condition[primaryKeys[i]] = this[primaryKeys[i]]
    }


    return this.callInterceptors('beforeUpdate', [self, options])
    .then(function(){
      var values = {}
      var changes = self.getChangedValues()
      var hasChanges = false

      for(var name in self.model.definition.attributes){
        var attr = self.model.definition.attributes[name]

        if(attr.persistent && changes.hasOwnProperty(name)){
          // if attribute has `getChangedValues` (e.g. composite type)
          if(changes[name] && typeof changes[name].getChangedValues === 'function' && changes[name].definition){
            var subchanges = changes[name].getChangedValues()
            for(var subname in subchanges){
              if(subchanges.hasOwnProperty(subname)){
                values[name + '.' + subname] = changes[name].definition.cast(subname, subchanges[subname], 'write', changes[name])
                hasChanges = true
              }
            }
          }else{
            values[name] = self.model.definition.cast(name, changes[name], 'write', self)
            hasChanges = true
          }
        }
      }

      var afterUpdate = function(){
        return self.callInterceptors('afterUpdate', [self, options])
      }

      // call afterUpdate hook even there was nothing to save for the current record!
      if(!hasChanges) return afterUpdate()

      return query
      .where(condition)
      .update(values)
      .catch(function(error){
        self.logger.warn(query.toString())
        throw new Store.SQLError(error)
      })
      .then(function(result){
        self.logger.info(query.toString())
        return afterUpdate()
      })
    })
  },





  _create: function(options){
    const Store = require('../../store')

    var self = this
    var query = this.definition.query(options)

    // TODO multiple primary keys?!?!
    var primaryKeys = this.definition.primary_keys
    var primaryKey = primaryKeys[0]

    return this.callInterceptors('beforeCreate', [self, options])
    .then(function(){
      var values = {}
      var changes = self.getChangedValues()

      for(var name in self.model.definition.attributes){
        var attr = self.model.definition.attributes[name]

        if(attr.persistent && changes.hasOwnProperty(name)){
          values[name] = self.model.definition.cast(name, changes[name], 'write', self)
        }
      }

      return query
      .returning(primaryKey)
      .insert(values)
      .catch(function(error){
        self.logger.warn(query.toString())
        throw new Store.SQLError(error)
      })
      .then(function(result){
        self.logger.info(query.toString())

        var idTmp = {}
        idTmp[primaryKey] = result[0]

        self.__exists = true
        self.set(idTmp, 'read')

        return self.callInterceptors('afterCreate', [self, options])
      })
    })
  }
}




exports.model = {
  /**
   * Updates all records which match the conditions. beforeSave, afterSave, beforeUpdate and afterUpdate want be called!
   * @class Model
   * @method updateAll
   * @alias update
   *
   * @callback
   * @param {boolean} success - Returns true if the update was successfull
   * @param {integer} affected_records - The number of affected records
   * @this Collection
   *
   * @return {Promise}
   */
  update: function(attributes, options){
    return this.updateAll(attributes, options)
  },
  updateAll: function(attributes, options){
    const Store = require('../../store')

    var self = this.chain()

    var query = self.query(options)


    return self.callInterceptors('beforeFind', [query])
    .then(function(){
      return query.update(attributes)
    })
    .catch(function(error){
      self.logger.warn(query.toString())
      throw new Store.SQLError(error)
    })
    .then(function(response) {
      self.logger.info(query.toString())
    })
  }
}
