
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
      
      if(value === null){
        operator = 'is';
      }
      
      
      if(value instanceof Array){
        
        /*
        this._statements.push({
          grouping: 'where',
          type: 'whereIn',
          column: column,
          value: values,
          not: not || false,
          bool: this._bool()
        });
        */
        if(operator == '!='){
          query.whereNotIn(table + '.' + name, value);
        }else{
          if(operator == '='){
            query.whereIn(table + '.' + name, value);
          }else{

            if(operator == 'between'){
              if(value[0] instanceof Array){
                
                (function(query, field, value){
                  query.where(function(){
                    for(var i = 0; i < value.length; i++){
                      this.orWhereBetween(field, value[i]);
                    }
                  });
                })(query, table + '.' + name, value);
                
              }else{
                query.whereBetween(table + '.' + name, value);
              }    
                        
            }else{
              if(having){
                for(var i in value){
                  query.orHaving(table + '.' + name, operator, value[i]);
                } 
              }else{
                
                (function(query, field, operator, value){
                  query.where(function(){
                    for(var i in value){
                      this.orWhere(field, operator, value[i]);
                    }                
                  });
                })(query, table + '.' + name, operator, value);
              }
            }
          }
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