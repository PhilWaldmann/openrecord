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
    var self = this.chain();
    offset = offset || self.getInternal('offset') || 0;

    self.setInternal('limit', limit);
    self.setInternal('offset', offset);
  
    return self;
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
    var self = this.chain();
    var limit = self.getInternal('limit');
  
    self.setInternal('offset', offset);
  
    if(!limit){ //TODO: sql specific feature. move to stores/sql?
      self.setInternal('limit', 999999999); //offset without a limit => limit = maximum number (Number.MAX_SAFE_INTEGER is to much for SQLite3 and MySQL)
    }
  
    return self;
  }
};