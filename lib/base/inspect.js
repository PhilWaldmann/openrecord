/*
 * MODEL
 */
exports.model = {

  inspect: function(indent){
    if(!this.definition){
      return ''
    }

    indent = indent || 0
    var indentStr = ''
    var i

    for(i = 0; i < indent; i++){
      indentStr += ' '
    }

    if(this.chained){
      var tmp = '[\n'
      var records = []
      for(i = 0; i < this.length; i++){
        records.push(this[i].inspect(indent + 2))
      }
      if(records.length === 0){
        return '<' + this.definition.model_name + ' [empty result]>'
      }

      tmp += records.join(',\n')

      tmp += '\n' + indentStr + ']'

      return tmp
    }

    var attributes = []
    for(var name in this.definition.attributes){
      if(this.definition.attributes.hasOwnProperty(name)){
        attributes.push(name)
      }
    }

    return '<' + this.definition.model_name + ' [' + attributes.join(', ') + ']>'
  }

}

exports.record = {

  inspect: function(indent, nested){
    if(!this.model){
      return ''
    }

    indent = indent || 0

    var tmp = ''
    var indentStr = ''
    var name
    var i

    for(i = 0; i < indent; i++){
      indentStr += ' '
    }

    if(nested !== true) tmp += indentStr

    tmp += '<' + this.model.definition.model_name + ' {'

    var attributes = []
    for(name in this.attributes){
      if(this.attributes.hasOwnProperty(name) && this.definition.attributes[name] && this.definition.attributes[name].hidden !== true){
        attributes.push(name + ':' + JSON.stringify(this.attributes[name]))
      }
    }

    tmp += attributes.join(' ')

    var relations = []
    for(name in this.relations){
      if(this.relations.hasOwnProperty(name) && (this.relations[name])){
        if((this.definition.relations[name].type === 'has_many' || this.definition.relations[name].type === 'belongs_to_many') ? this.relations[name].length > 0 : true) {
          relations.push('\n  ' + indentStr + name + ': ' + this.relations[name].inspect(indent + 2, (this.definition.relations[name].type !== 'has_many' && this.definition.relations[name].type !== 'belongs_to_many')))
        }
      }
    }

    if(relations.length > 0){
      tmp += ','
    }
    tmp += relations.join(',')
    if(relations.length > 0){
      tmp += '\n' + indentStr
    }

    tmp += '}>'

    return tmp
  }

}
