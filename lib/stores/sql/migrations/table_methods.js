exports.migration = {
  
  createTable: function(name, options, fn){
    var self = this;
    var fields = [];
    
    this.fields = fields;
    
    if(typeof options == 'function'){
      fn = options;
      options = {};
    }
    
    options = options || {};
    
    //add the ide column, if not disabled
    if(options.id !== false){
      this.increments('id', {
        primary: true
      })
    }
    
    //Call custom createTable() method    
    if(typeof fn == 'function'){
      fn.call(this);
    }
    
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.createTable(name, function(table){
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
  
  
  
  
  
  renameTable: function(from, to){
    var self = this;
        
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.renameTable(from, to).then(function(){
        next();
      }, function(err){
        next(err);
      });
    });
    
    return this;
  },
  
  
  
  
  removeTable: function(table){
    var self = this;
        
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.dropTableIfExists(table).then(function(){
        next();
      }, function(err){
        next(err);
      });
    });
    
    return this;
  }
};