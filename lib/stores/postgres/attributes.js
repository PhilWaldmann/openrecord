/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this;
      
      console.log(self.model_name, self.store.connection(self.model_name).select('title', 'author', 'year').toString());
      
    });
    
  }
}