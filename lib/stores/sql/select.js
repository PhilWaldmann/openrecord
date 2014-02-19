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
     
      if(joins.length == 0) return true;
      
     
      for(var name in self.attributes){
        select.push(self.table_name + '.' + name + ' AS f' + index);
        select_map['f' + index++] = name;
      }
     
      for(var i in joins){
        var relation = joins[i].relation;
        var pre = joins[i].name_tree.join('.');    
        
        for(var name in relation.model.definition.attributes){
          select.push(joins[i].name + '.' + name + ' AS f' + index)
          select_map['f' + index++] = pre + '.' + name;
        }
        
        star = false;
      }
      
      if(!star){
        query.select(select);
        this.setInternal('select_map', select_map);
      }
      
      return true;
    }, -50);
    
    
    
    
    this.afterFind(function(data){
      var data = data.result;
      var select_map = this.getInternal('select_map');

      if(select_map){
        for(var i = 0; i < data.length; i++){
          var r = {};
          for(var attr in data[i]){
            
            if(data[i].hasOwnProperty(attr)){
              if(data[i][attr] == null) continue; //if value is null
              if(!select_map[attr]) continue; //if there is a value which was not in the original select (?!)
              var names = select_map[attr].split('.');
              var tmp = r;
              for(var n = 0; n < names.length; n++){
                if(n < names.length - 1){
                  tmp[names[n]] = tmp = tmp[names[n]] || {};
                }else{
                  tmp[names[n]] = data[i][attr];
                }
              }
            }
                               
          }
          data[i] = r;
        }
      }
                              
    }, 100);
        
  }
};