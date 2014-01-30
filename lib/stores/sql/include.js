var Utils = require('../../utils');

/*
 * MODEL
 */
exports.model = {
  include: function(){
    var self = this.chain();
    var relations = Utils.args(arguments); 

    for(var i in relations){
      var relation = self.definition.relations[relations[i]];
      if(relation){
        self.addInternal('includes', {relation: relation}); 
      }else{
        throw new Error('Can not find relation ' + relations[i]);
      }
    }
    
    return self;
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;   
     
    this.beforeFind(function(query){
      var joins = this.getInternal('joins') || [];
      var includes = this.getInternal('includes') || [];
      var conditions = this.getInternal('conditions') || [];
      
      for(var i in includes){
        var relation = includes[i].relation;
        var table_name = relation.model.definition.table_name;
        var join = joins.length == 0 && includes.length == 1;
        
        for(var c in conditions){
          if(conditions[c].table == table_name){
            join = true;
          }
        }
        
        if(join){
          //query.join(table_name, self.table_name + '.' + relation.primary_key, '=', table_name + '.' + relation.foreign_key, '');
          this.addInternal('joins', {relation:relation, type:'left'}); 
        }else{
          includes[i].afterFind = true;
        }
        
      }
      
      return true;
    });
    
    
    this.afterFind(function(data, next){
      var data = data.result;
      var includes = this.getInternal('includes') || [];
            
      var done = 0;
      var todo = 0;
      
      for(var i in includes){
        if(includes[i].afterFind){
          todo++;
          
          includes[i].afterFind = false;
          var relation = includes[i].relation;
          
          var records = {};
          
          for(var r in data){
            records[data[r][relation.primary_key]] = data[r];
          }
          
          var condition = {};
          condition[relation.foreign_key] = Object.keys(records);
          
          relation.model.where(condition).exec(function(sub_records){
            
            for(var r in sub_records){
              var record = records[sub_records[r][relation.foreign_key]];

              if(record){
                if(relation.type == 'belongs_to'){
                  record[relation.name] = sub_records[r];
                }
                if(relation.type == 'has_many'){
                  record[relation.name] = record[relation.name] || []
                  record[relation.name].push(sub_records[r]);
                }
              }
            }
            
            done++;
            
            if(done == todo){
              next(true);
            }
            
          });
        }        
      }
      
      if(todo == 0) return next(true);
      
    }, 80);
    
  }
};