var inflection = require('inflection');
var async = require('async');

var Store = require('../../store');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
      
    this.on('relation_added', function(options){

      var primary_key = this.primary_keys[0]; //should we throw an error here if there is no primary key?
            
      if(options.type == 'has_many'){
        options.foreign_key = options.foreign_key || inflection.singularize(self.table_name) + '_' + primary_key;
        options.primary_key = options.primary_key || primary_key;
      }
      
      if(options.type == 'belongs_to'){
        options.primary_key = options.primary_key || inflection.singularize(options.model.definition.table_name) + '_' + primary_key;
        options.foreign_key = options.foreign_key || primary_key;
      }
             
    });
    
    
    
    this.on('relation_record_added', function(options, record){
      if(options.type == 'has_many'){
        record[options.foreign_key] = this[options.primary_key];
      }
    });
    
    
    
    
    var beforeHook = function(transaction, next){
      var record = this;
      var tmp = [];
      
      for(var i in self.relations){
        var relation = self.relations[i];
        if(relation.type == 'belongs_to'){
          if(record[relation.name]){
            
            (function(relation){
              tmp.push(function(done){
                record[relation.name].save({transaction:transaction}, function(okay){
                  if(okay){
                    record[relation.primary_key] = this[relation.foreign_key];
                    return done();
                  }
                  done('STOP');
                });
              });
            })(relation);
            
          }
        }
      }
      
      async.parallel(tmp, function(err){
        //TODO: Error handling
        next(err == null);
      });
      
    };
    
    
    var afterHook = function(record, transaction, next){
      var tmp = [];

      for(var i in self.relations){
        var relation = self.relations[i];

        if(relation.type == 'has_many'){
          if(this[relation.name].length > 0){
            
            for(var i = 0; i < this[relation.name].length; i++){
              
              (function(relation, subrecord){
                tmp.push(function(done){
                  subrecord[relation.foreign_key] = record[relation.primary_key];
                  subrecord.save({transaction:transaction}, function(okay){                    
                    if(okay){
                      return done();
                    }
                    done('STOP');
                  });
                });
              })(relation, this[relation.name][i]);
              
            }
            
          }
        }
      }
      
      if(tmp.length === 0){
        return next(true);
      }
      
      async.series(tmp, function(err){
        //TODO: Error handling
        next(err == null);
      });
    };
    
    //TODO: use beforeSave and afterSave !?
    this.beforeCreate(beforeHook, 100);
    this.beforeUpdate(beforeHook, 100);
    this.afterCreate(afterHook, 100);
    this.afterUpdate(afterHook, 100);
    
  }
};