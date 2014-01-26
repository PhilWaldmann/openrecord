
/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;   
     
    
    this.afterFind(function(records, next){
      
    }, 10);
    
  }
};