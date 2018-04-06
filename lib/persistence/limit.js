exports.model = {
  /**
   * Limit the resultset to `n` records
   * @class Model
   * @method limit
   * @param {integer} limit - The limit as a number.
   * @param {integer} offset - Optional offset.
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  limit: function(limit, offset){
    var self = this.chain()
    offset = offset || self.getInternal('offset') || 0

    if(typeof limit === 'string') limit = parseInt(limit)
    if(typeof offset === 'string') offset = parseInt(offset)

    if(!isNaN(limit)){
      self.setInternal('limit', limit)
      self.setInternal('no_relation_cache', true)
    }
    if(!isNaN(offset)){
      self.setInternal('offset', offset)
      self.setInternal('no_relation_cache', true)
    }

    return self
  },

  // alias for singleResult
  first: function(limit){
    return this.singleResult(limit)
  },

  singleResult: function(limit){
    var self = this.chain()

    self.setInternal('single_result', true)
    if(limit !== false) self.limit(1)

    return self
  },

  /**
   * Sets only the offset
   * @class Model
   * @method offset
   * @param {integer} offset - The offset.
   *
   * @see Model.limit
   *
   * @return {Model}
   */
  offset: function(offset){
    var self = this.chain()

    self.setInternal('offset', offset)

    return self
  },



  clearPagination: function(){
    return this.limit().offset(0)
  }
}

exports.definition = {
  mixinCallback: function(){
    var self = this

    this.afterFind(function(data){
      self.logger.trace('persistent/limit', data)
      const singleResult = this.getInternal('single_result', true)
      
      if(singleResult && Array.isArray(data.result)){             
        data.result = data.result[0]
      }
    }, 40)
  }
}
