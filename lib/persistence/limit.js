exports.model = {
  /**
   * Limit the resultset to `n` records
   * @section Model/Find
   * @method limit
   * @param {integer} limit - The limit as a number.
   * @param {integer} offset - Optional offset.
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  limit: function(limit, offset){
    var self = this.chain();
    offset = offset || 0;

    self.setInternal('limit', limit);
    self.setInternal('offset', offset);
  
    return self;
  },
  
  
  /**
   * Sets only the offset
   * @section Model/Find
   * @method offset
   * @param {integer} offset - The offset.
   *
   * @see Model.limit
   *
   * @return {Model}
   */
  offset: function(offset){
    var self = this.chain();
  
    self.setInternal('offset', offset);
  
    return self;
  }
};