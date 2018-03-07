exports.utils = {

  getAttributeName: function(chain, condition, escape){
    var table = condition.model.definition.table_name
    var nameTree = condition.name_tree

    if(nameTree.length > 0){
      table = this.nameTreeToNames(table, nameTree)
    }

    var result = table + '.' + condition.attribute

    if(escape){
      const query = chain.query()
      result = query.client.formatter(query).wrapString(result)
    }

    return result
  }

}
