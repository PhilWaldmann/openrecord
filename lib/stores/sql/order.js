var Utils = require('../../utils');

/*
 * MODEL
 */
exports.model = {
  /**
   * Set a sort order
   * @area Model/Find
   * @method order
   * @param {array} columns - Array of field fro the sort.
   * @param {boolean} desc - Optional: Set to `true` to order descent
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  order: function(columns, desc){
    var self = this.chain();
    
    if(typeof desc === 'boolean'){
      if(!(columns instanceof Array)) columns = [columns];
    }else{
      columns = Utils.args(arguments);
      desc = false;
    }
    
    for(var i in columns){
      self.addInternal('order', {column:columns[i], order: desc ? 'DESC' : 'ASC'});
    }
  
    return self;
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(query){
      var order = this.getInternal('order');
      
      if(order){
        for(var i in order){
          query.orderBy(order[i].column, order[i].order);
        }        
      }
      
      return true;
    }, 50);
        
  }
};