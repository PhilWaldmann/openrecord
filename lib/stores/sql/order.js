/*
 * MODEL
 */
exports.model = {
  order: function(column, desc){
    var self = this.chain();
      
    self.addInternal('order', {column:column, order: desc ? 'DESC' : 'ASC'});
  
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
    });
        
  }
};