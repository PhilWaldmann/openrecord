
exports.applyConditions = function(conditions, table_map, query, having){
  
  for(var i in conditions){
    if(!conditions[i]) continue
        
    if(conditions[i].type == 'raw'){
      
      for(var a = 0; a < conditions[i].args.length; a++){
        //Hacky fix for a knex problem!
        if(conditions[i].args[a] instanceof Array){
          var len = conditions[i].args[a].length;
          conditions[i].args.splice.apply(conditions[i].args, [a, 1].concat(conditions[i].args[a]));
          
          var index = 0;
          conditions[i].query = conditions[i].query.replace(/\?/g, function(){
            if(index === a){
              var tmp = [];
              for(var k = 0; k < len; k++){
                tmp.push('?');
              }

              return tmp.join(',');
            }
            index++;
            return '?';
          });
          
          a += len;
          
        }
      }
      
      if(having){
        query.havingRaw(conditions[i].query, conditions[i].args);
      }else{
        query.whereRaw(conditions[i].query, conditions[i].args);
      }
           
    }else{
      var name = conditions[i].field;
      var table = conditions[i].table;
      var value = conditions[i].value;
      var operator = conditions[i].operator;
      var name_tree = conditions[i].name_tree;
      
      if(table_map && name_tree.length > 0){
        if(table_map[name_tree.join('.')]) table = table_map[name_tree.join('.')];
      }
      
      if(value instanceof Array && value.length === 0){
        value = null;
        operator = 'is';
      }
      
      
      if(value instanceof Array){
        var condition;
        
        if(operator == '!='){
          condition = {type: 'NotIn', column: table + '.' + name, operator: operator, value: value, bool: 'and'};
        }else{
          if(operator == '='){
            condition = {type: 'In', column: table + '.' + name, operator: operator, value: value, bool: 'and'};
          }else{
            
            if(operator == 'between'){
              if(value[0] instanceof Array){
                query.where(function(){
                  for(var i = 0; i < value.length; i++){
                    this.orWhereBetween(table + '.' + name, value[i]);
                  }
                });
              }else{
                query.whereBetween(table + '.' + name, value);
              }              
            }else{
              if(having){
                for(var i in value){
                  query.orHaving(table + '.' + name, operator, value[i]);
                } 
              }else{
                query.where(function(){
                  for(var i in value){
                    this.orWhere(table + '.' + name, operator, value[i]);
                  }                
                });
              }
            }
          }
        }
        
        if(condition){
          if(having){
            query.havings.push(condition);
          }else{
            query.wheres.push(condition);
          }
        
          query.bindings = query.bindings.concat(value);
        }        
                      
      }else{
        if(having){
          query.having(table + '.' + name, operator, value);
        }else{
          query.where(table + '.' + name, operator, value);
        }
      }
    }
  }
};