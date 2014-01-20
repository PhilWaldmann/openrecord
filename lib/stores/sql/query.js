/*
 * MODEL
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    var connection = function(table_name){
      if(!self.store.connection) return;
      
      return self.store.connection(table_name || self.table_name);
    };
    
    this.instanceMethods.__defineGetter__('query', connection);
    this.staticMethods.__defineGetter__('query', connection);
  }
}