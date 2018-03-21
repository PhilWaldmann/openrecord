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

    if(!isNaN(limit)) self.setInternal('limit', limit)
    if(!isNaN(offset)) self.setInternal('offset', offset)

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
      var limit = this.getInternal('limit')

      if(limit === 1 && Array.isArray(data.result)){
        data.result = data.result[0]
      }
    }, 40)
  }
}
