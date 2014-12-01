var Utils = require('../../utils');


/*
 * MODEL
 */
exports.model = {
  
  /**
   * Specify SQL select fields. Default: *
   * @class Model
   * @method select
   * @param {array} fields - The field names
   *
   *
   * @return {Model}
   */
  select: function(){
    var self = this.chain();

    var args = Utils.args(arguments);
    var fields = []
    fields = fields.concat.apply(fields, args); //flatten
    
    self.addInternal('select', fields);
    
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
      var custom = this.getInternal('select');  
      var joins = this.getInternal('joins') || [];
      var select = [];
      var select_map = {};
      var index = 0;
      var star = true;
           
      
      //check if there was an aggregate function was called
      var agg_fns = ['count', 'sum', 'min', 'max', 'avg'];
      
      for(var i in agg_fns){
        if(this.getInternal(agg_fns[i])){
          return;
        }
      }
      
           
      if(custom){
        select = custom;
        select_map = null;
        star = false;
        
        var asJson = joins.length > 0;
                
        for(var i = 0; i < select.length; i++){
          //check for function calls => don't escape them!
          if(select[i].match(/(\(|\))/)){
            select[i] = self.store.connection.raw(select[i]);
            asJson = true;
          }
        }
        
        if(asJson){
          this.asJson();
          this.asRaw();
        }else{
          this.setInternal('allowed_attributes', select);
        }
        
      }else{
        
        if(joins.length > 0){
          for(var name in self.attributes){
            if(self.attributes[name].persistent){
              select.push(self.table_name + '.' + name + ' AS f' + index);
              select_map['f' + index++] = name;
            }        
          }
        
          for(var i in joins){
            var relation = joins[i].relation;
            var pre = joins[i].name_tree.join('.');    
        
            if(joins[i].as){
              pre = joins[i].as.join('.');
            }
        
            for(var name in relation.model.definition.attributes){
              if(relation.model.definition.attributes[name].persistent){
                select.push(joins[i].name + '.' + name + ' AS f' + index)
                select_map['f' + index++] = pre + '.' + name;
              }          
            }        
            star = false;
          }
        }        
      }
      
      
      
      
      
      
      if(!star){
        query.select(select);
        this.setInternal('select_map', select_map);
      }
      
      return true;
    }, -50);
    
    
    
    
    this.afterFind(function(data){
      self.logger.trace('sql/select', data);
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