var async = require('async');

var Store = require('../../store');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
  
  
    this.beforeSave(function(record, options, next){
      var record = this;
      var tmp = [];
      
      for(var i in self.relations){
        var relation = self.relations[i];
        if(relation.type.through) continue;
        
        if(relation.type == 'belongs_to' && !relation.through){
          if(record[relation.name]){
            
            (function(relation){
              tmp.push(function(done){
                record[relation.name].save(function(okay){
                  if(okay){
                    record[relation.primary_key] = this[relation.foreign_key];
                    return done();
                  }
                  done('STOP');
                }, done);
              });
            })(relation);
            
          }
        }
      }
      
      async.parallel(tmp, function(err){
        next(err ? err : true);
      });
      
    }, 100);
    
    
    this.afterSave(function(record, options, next){
      var tmp = [];
      var this_record = this;

      for(var i in self.relations){
        var relation = self.relations[i];
        if(relation.type.through) continue;

        if(relation.type == 'has_many' && !relation.through){
          if(this.relations[relation.name] && this.relations[relation.name].length > 0){
                      
            for(var i = 0; i < this[relation.name].length; i++){

              (function(relation, subrecord){
                tmp.push(function(done){
                  subrecord[relation.foreign_key] = record[relation.primary_key];
                  subrecord.save(function(okay){                    
                    if(okay){
                      return done();
                    }
                    done('STOP');
                  }, done);
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
                this_record[relation.name].save(function(okay){
                  if(okay){
                    return done();
                  }
                  done('STOP');
                }, done);
              }); 
            })(relation);       
          }
        }
        
        
      }
      
      if(tmp.length === 0){
        return next(true);
      }
      
      async.series(tmp, function(err){
        next(err ? err : true);
      });
    }, 100);
    
    
  }
};