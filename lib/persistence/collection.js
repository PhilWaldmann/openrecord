/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.afterFind(function(data){
      self.logger.trace('persistent/collection', data)
      var asJson = this.getInternal('as_json')
      var asRaw = this.getInternal('as_raw')
      var records = data.result
      var i

      this.setInternal('resolved', true)

      if(!records) return

      if(asJson !== true){
        // CREATE RECORDs WITH DATA
        for(i = 0; i < records.length; i++){
          records[i] = this.new(records[i], 'read')
          records[i]._exists()
        }

        data.result = this
      }else{
        // RETURN RAW JSON
        if(!asRaw){
          var allowedAttributes = this.getInternal('allowed_attributes')
          var dummyRecord = this.new() // will covert values to the right format

          for(i = 0; i < records.length; i++){
            dummyRecord.relations = {}
            dummyRecord.attributes = {}
            dummyRecord.set(records[i], 'read')
            records[i] = dummyRecord.toJson(allowedAttributes)
          }
        }
      }
    }, 55)
  }
}


/*
 * MODEL
 */
exports.model = {
  /**
   * Creates a new record and saves it
   * @class Model
   * @method create
   * @param {object} data - The data of the new record
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {boolean} result - true if the create was successful
   * @this Record
   *
   * @return {Model}
   * @see Model.save()
   */
  create: function(data, resolve, reject){
    if(Array.isArray(data)){
      return this.chain().add(data)
    }
    return this.new(data).save(resolve, reject)
  },


  /**
   * `exec()` will return raw JSON instead of records
   * @class Model
   * @method asJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   *
   * @return {Model}
   * @see Model.exec()
   */
  asJson: function(allowedAttributes){
    var self = this.chain()

    self.setInternal('as_json', true)

    if(Array.isArray(allowedAttributes)) self.setInternal('allowed_attributes', allowedAttributes)

    return self
  },


  /**
   * `exec()` will return the raw store output
   * Be aware, that no `afterFind` hook will be fired if you use `asRaw()`.
   *
   * @class Model
   * @method asRaw
   *
   * @return {Model}
   * @see Model.exec()
   */
  asRaw: function(){
    var self = this.asJson()

    self.setInternal('as_raw', true)

    return self
  }
}



/*
 * CHAIN
 */
exports.chain = {

  add: function(records){
    var self = this.callParent(records)

    var relation = self.getInternal('relation')
    var parentRecord = self.getInternal('relation_to')

    if(!Array.isArray(records)) records = [records]

    for(var i = 0; i < records.length; i++){
      var record = records[i]
      if(typeof record !== 'object'){
        if(!relation || !relation.through || !parentRecord) continue

        var throughRel = parentRecord.model.definition.relations[relation.through]
        var targetRel = throughRel.model.definition.relations[relation.relation]

        var tmp = {}
        var base

        for(base in throughRel.conditions){
          if(throughRel.conditions[base] && throughRel.conditions[base].attribute){
            tmp[base] = parentRecord[throughRel.conditions[base].attribute]
          }else{
            tmp[base] = throughRel.conditions[base]
          }
        }

        for(base in targetRel.conditions){
          if(targetRel.conditions[base] && targetRel.conditions[base].attribute){
            tmp[targetRel.conditions[base].attribute] = record
          }
        }

        if(throughRel.type === 'has_many' || throughRel.type === 'belongs_to_many'){
          parentRecord[relation.through].add(tmp)
        }else{
          parentRecord[relation.through] = tmp
        }
      }
    }

    return self
  },

  _exists: function(){
    this.setInternal('resolved', true)
    for(var i = 0; i < this.length; i++){
      this[i]._exists()
    }
  }
}



/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var chainedModel = config ? config.__chained_model : null

    if(this.model.chained){
      chainedModel = this
    }

    Object.defineProperty(this, '__chained_model', {enumerable: false, writable: true, value: chainedModel})
    Object.defineProperty(this, '__exists', {enumerable: false, writable: true, value: false})
  },

  _exists: function(){
    this.__exists = true
    this.changes = {} // Hard-Reset all changes

    for(var name in this.definition.relations){
      if(this.definition.relations.hasOwnProperty(name)){
        if(this.relations && this.relations[name]){
          this.relations[name]._exists()
        }
      }
    }
  }
}
