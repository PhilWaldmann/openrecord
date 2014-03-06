exports.migration = {
  addColumn: function(table, columnFn){
    var self = this;
        
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        columnFn.call(self, table);        
      }).then(function(){
        next();
      }, function(err){
        next(err);
      });
    });
    
    return this;
  },


  renameColumn: function(table, from, to){
    var self = this;
        
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        table.renameColumn(from, to);     
      }).then(function(){
        next();
      }, function(err){
        next(err);
      });
    });
    
    return this;
  },
  
  
  removeColumn: function(table, name){
    var self = this;
        
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        if(name instanceof Array){
          table.dropColumns.apply(table, name);
        }else{
          table.dropColumn(name);
        }        
      }).then(function(){
        next();
      }, function(err){
        next(err);
      });
    });
    
    return this;
  },
  
  
  
  
  setColumnOptions: function(column, options){
    if(typeof column == 'string') throw new Error('first param needs to be a column object');
    
    if(options.primary){
      column.primary();
    }
    
    if(options.unique){
      column.unique();
    }
    
    if(options.default != undefined){
      column.defaultTo(options.default);
    }
    
    if(options.notnull || options.not_null){
      column.notNullable();
    }
  }
};