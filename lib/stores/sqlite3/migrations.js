exports.migration = {
  addColumn: function(table, columnFn){
    var self = this;
    var fields = this.fields = [];
    
    if(typeof columnFn === 'function'){
      columnFn.call(self);
    }
     
        
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        for(var i = 0; i < fields.length; i++){
          if(typeof fields[i] == 'function'){
            fields[i].call(self, table);
          }
        }
      }).then(function(){
        next();
      }, function(err){
        next(err);
      });
    });
    
    return this;
  },


  renameColumn: function(table, from, to){
    console.log('NO SUPPORT FOR SQLITE3 AT THE MOMENT');  
    return this;
  },
  
  
  removeColumn: function(table, name){
    console.log('NO SUPPORT FOR SQLITE3 AT THE MOMENT');    
    return this;
  }
};