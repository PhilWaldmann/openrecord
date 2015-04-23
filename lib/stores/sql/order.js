var util = require('util');
var Utils = require('../../utils');

/*
 * MODEL
 */
exports.model = {
  /**
   * Set a sort order
   * @class Model
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
    
    if(columns){
      if(typeof desc === 'boolean'){
        if(!util.isArray(columns)) columns = [columns];
      }else{
        columns = Utils.args(arguments);
        desc = false;
      }
    
      for(var i in columns){
        self.addInternal('order', {column:columns[i], order: desc ? 'DESC' : 'ASC'});
      }
    }else{
      self.clearInternal('order');
    }   
  
    return self;
  },
  
  
  sort: function(){
    this.order.apply(this, arguments);
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(query){
      var order = this.getInternal('order');
      
      //check if there was an aggregate function was called
      var agg_fns = ['count', 'sum', 'min', 'max', 'avg'];
      
      for(var i in agg_fns){
        if(this.getInternal(agg_fns[i])){
          return;
        }
      }
      
      if(order){
        for(var i in order){
          query.orderBy(order[i].column, order[i].order);
        }        
      }
      
      return true;
    }, -60);
        
  }
};