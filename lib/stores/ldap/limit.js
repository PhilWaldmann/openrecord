
/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(options){
      
      
      return true;
    }, -40);
    
    
    this.afterFind(function(data){
      var limit = this.getInternal('limit');

      if(limit == 1){
        data.result = data.result[0];
      }
      
      return true;
    }, 40);
    
  }
};