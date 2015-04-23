var util = require('util');

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
        if(util.isArray(name)){
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