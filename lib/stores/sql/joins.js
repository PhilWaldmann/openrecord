var Utils = require('../../utils');

/*
 * MODEL
 */
exports.model = {
  join: function(relations, type){
    var self = this.chain();

    if(relations instanceof Array && typeof type == 'string'){
      
      for(var i in relations){
        var relation = self.definition.relations[relations[i]];
        if(relation){
          self.addInternal('joins', {relation:relation, type:type}); 
        }else{
          throw new Error('Can not find relation ' + relations[i]);
        }
      }
            
    }else{
      var args = Utils.args(arguments); 
      self.join(args, 'left');
    } 
    return self;
  },
  
  left_join: function(){
    return this.join(Utils.args(arguments), 'left')
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
  
      for(var i in joins){
        var relation = joins[i].relation;
        var table_name = relation.model.definition.table_name;
            
        query.join(table_name, self.table_name + '.' + relation.primary_key, '=', table_name + '.' + relation.foreign_key, joins[i].type);
      }
            
      return true;
    });
    
    
    //TODO: into collection... check multiple "subrecords" as well...
    this.afterFind(function(data){
      var records = data.result;
      var joins = this.getInternal('joins') || [];
      
      if(joins.length == 0) return true;
      
      var tmp = {};
      
      for(var r in records){
        var key = [];
        for(var p in self.primary_keys){
          key.push(records[r][self.primary_keys[p]]);
        }
        key = key.join(',');
        
        if(!tmp[key]) tmp[key] = records[r];
        
        for(var i in joins){
          var relation = joins[i].relation;
          var table_name = relation.model.definition.table_name;
          
          if(records[r][table_name] && relation.type == 'has_many'){
            if(tmp[key][table_name] instanceof Array){
              tmp[key][table_name].push(records[r][table_name]);
            }else{
              tmp[key][table_name] = [records[r][table_name]];                    
            }
          }
          
        }        
      }
            
      data.result = [];
      for(var i in tmp){
        data.result.push(tmp[i]);
      }
      
    }, 90);
    
  }
};