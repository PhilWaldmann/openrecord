exports.utils = {
  sanitizeConditions: function(parent, conditions, nameTree, relation){
    var result = this.callParent(parent, conditions, nameTree, relation)
    var attrsRegExp = new RegExp('(' + Object.keys(parent.definition.attributes).join('|') + ')', 'g')

    result.forEach(function(condition){
      if(process.env.NODE_ENV === 'test'){
        // add quotes to attribute names for easier testing
        if(condition.type === 'raw'){
          condition.query = condition.query.replace(attrsRegExp, '"$1"')
        }
      }

      if(condition.type === 'hash'){
        var def = parent.definition.attributes[condition.attribute]
        if(def && def.type.name === 'date'){
          condition.value = convertToDate(condition.value)
        }
      }
    })

    return result
  }
}


function convertToDate(value){
  if(typeof value === 'string'){
    return new Date(value)
  }

  if(value instanceof Array){
    return value.map(function(val){
      return convertToDate(val)
    })
  }
}
