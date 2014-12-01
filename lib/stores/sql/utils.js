exports.utils = {

  getAttributeName: function(chain, condition){
    var table = condition.model.definition.table_name;
    var name_tree = condition.name_tree;
    var table_map = chain.getInternal('table_map');
    
    if(table_map && name_tree.length > 0){
      if(table_map[name_tree.join('.')]) table = table_map[name_tree.join('.')];
    }
  
    return table  + '.' + condition.attribute;
  }
  
};