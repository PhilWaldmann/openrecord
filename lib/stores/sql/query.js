/*
 * DEFINITION
 */
exports.definition = {
  query: function(){
    var connection = this.store.connection;
    return connection(this.table_name);
  }
};


exports.chain = {
  mixinCallback: function(){
    var self = this;
      
    this.__defineGetter__('query', function(){
      var connection = this.definition.store.connection;
      if(!connection) return;
      

      var query = self.getInternal('query');
      
      if(!query){
        query = connection(self.definition.table_name);
        self.setInternal('query', query);
      }      
      
      return query;
    });
  }
}