/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;  
      
    this.beforeFind(function(query){
      var joins = this.getInternal('joins') || [];
      var select = [];
      var select_map = {};
      var index = 0;
      var star = true;
     
      for(var name in self.attributes){
        select.push(self.table_name + '.' + name + ' AS f' + index)
        select_map['f' + index++] = name;
      }
     
      for(var i in joins){
        var relation = joins[i].relation;
        var table_name = relation.model.definition.table_name;
        
        for(var name in relation.model.definition.attributes){
          select.push(table_name + '.' + name + ' AS f' + index)
          select_map['f' + index++] = table_name + '.' + name;
        }
        
        star = false;
      }
      
      if(!star){
        query.select(select);
        this.setInternal('select_map', select_map);
      }
      
      return true;
    });
    
    
    
    
    this.afterFind(function(data){
      var data = data.result;
      var select_map = this.getInternal('select_map');

      if(select_map){
        for(var i in data){
          var r = {};
          for(var attr in data[i]){
            var name = select_map[attr];
            var match = name.match(/(.+)\.(.+)/);
            if(!data[i][attr]) continue;
            if(match){
              //relational data
              r[match[1]] = r[match[1]] || {};
              r[match[1]][match[2]] = data[i][attr];
              //check relation => arrays!!
            }else{
              r[name] = data[i][attr];
            }            
          }
          data[i] = r;
        }
      }
            
    }, 100);
        
  }
};