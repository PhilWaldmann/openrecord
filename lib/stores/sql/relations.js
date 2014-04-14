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
      options.conditions = options.conditions || {};
      
      if(options.as){
        options.foreign_key = options.foreign_key || options.as + '_' + primary_key;
        options.conditions[options.polymorphic_type || options.as + '_type'] = self.model_name;
      }
      
      if(options.polymorph){
        options.primary_key = options.name + '_' + primary_key;
        options.foreign_key = primary_key;
        options.type_key = options.type_key || options.name + '_type';
      }
            
      if(options.type == 'has_many' || options.type == 'has_one'){
        options.foreign_key = options.foreign_key || inflection.singularize(self.table_name) + '_' + primary_key;
        options.primary_key = options.primary_key || primary_key;
      }
      
      if(options.type == 'belongs_to'){
        options.primary_key = options.primary_key || inflection.singularize(options.model.definition.table_name) + '_' + primary_key;
        options.foreign_key = options.foreign_key || primary_key;
      }
            
    });
    
    
    
    this.on('relation_record_added', function(options, record){
      if(options.through){
        var through_rel = this.model.definition.relations[options.through];
        var target_rel = through_rel.model.definition.relations[options.relation];
        
        var tmp = {};
        tmp[through_rel.foreign_key] = this[through_rel.primary_key];
        tmp[target_rel.primary_key] = record[target_rel.foreign_key];
        tmp[options.relation] = record;
                
        if(through_rel.type == 'has_many'){
          this[options.through].add(tmp);
        }else{
          this[options.through] = tmp;
        }
      }else{
        if(options.type == 'has_many' || options.type == 'has_one'){
          record[options.foreign_key] = this[options.primary_key];
        }
      }      
    });
    
    this.on('has_many_initialized', function(options, collection){      
      if(options.type == 'has_many' && !options.polymorph){
        var conditions = {};
        conditions[options.foreign_key] = this[options.primary_key];
        collection.where(conditions);
      }
    });
    
    
    
    var beforeHook = function(record, transaction, next){
      var record = this;
      var tmp = [];
      
      for(var i in self.relations){
        var relation = self.relations[i];
        if(relation.type.through) continue;
        
        if(relation.type == 'belongs_to' && !relation.through){
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
      var this_record = this;

      for(var i in self.relations){
        var relation = self.relations[i];
        if(relation.type.through) continue;

        if(relation.type == 'has_many' && !relation.through){
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
        
        
        if(relation.type == 'has_one' && !relation.through){
          if(this[relation.name]){
            (function(relation){
              tmp.push(function(done){
                this_record[relation.name][relation.foreign_key] = record[relation.primary_key];
                this_record[relation.name].save({transaction:transaction, commit: false}, function(okay){
                  if(okay){
                    return done();
                  }
                  done('STOP');
                });
              }); 
            })(relation);       
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
    
    
    
    
    
    this.afterDestroy(function(record, transaction, next){
      
      var tmp = [];
      
      for(var i in self.relations){
        var relation = self.relations[i];
                
        (function(relation){
          if(relation.dependent == 'destroy' || relation.dependent == 'delete'){
            tmp.push(function(done){
              if(relation.type == 'has_many'){
                record[relation.name][relation.dependent]({transaction: transaction, rollback:false, commit:false}, function(success){
                  if(!success) return done('STOP');
                  done();
                });
              }else{
                var conditions = {};
                conditions[relation.foreign_key] = record[relation.primary_key];
                relation.model.where(conditions).transaction(transaction).limit(1).exec(function(subrecord){
                  if(subrecord){
                    subrecord[relation.dependent]({transaction: transaction, rollback:false, commit:false}, function(success){
                      if(!success) return done('STOP');
                      done();
                    });
                  }else{
                    done();
                  }
                });
              }
            });
          }
          
          if(relation.dependent == 'nullify'){
            tmp.push(function(done){
              if(relation.type == 'has_many'){ //TODO: add hasOne as well!
                var attrs = {};
                attrs[relation.foreign_key] = null;
                record[relation.name].updateAll(attrs, {transaction: transaction, rollback:false, commit:false}, function(success){
                  if(!success) return done('STOP');
                  done();
                });
              }              
            });
          }
          
        })(relation);   
      }
      
      if(tmp.length == 0){
        return next(true);
      }
      
      async.series(tmp, function(err){
        //TODO: Error handling
        next(err == null);
      });
      
    }, 100);
  }
};