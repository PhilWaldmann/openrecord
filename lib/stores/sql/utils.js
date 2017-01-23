exports.utils = {

  getAttributeName: function(chain, condition, escape){
    var table = condition.model.definition.table_name;
    var name_tree = condition.name_tree;
    //var table_map = chain.getInternal('table_map');

    if(name_tree.length > 0){
      /*if(table_map){
        if(table_map[name_tree.join('.')]) table = table_map[name_tree.join('.')];
      }else{*/
        table = this.nameTreeToNames(table, name_tree);
        //}

    }

    var result = table  + '.' + condition.attribute;

    if(escape){
      result = chain.query.client.formatter()._wrapString(result);
    }

    return result;
  }

};
