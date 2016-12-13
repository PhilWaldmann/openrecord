var util = require('util');


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

    return self;
  }
};

exports.definition = {
  mixinCallback: function(){
    var self = this;

    this.afterFind(function(data){
      self.logger.trace('persistent/limit', data);
      var limit = this.getInternal('limit');

      if(limit == 1 && util.isArray(data.result)){
        data.result = data.result[0];
      }

      return true;
    }, 40);

  }
}
