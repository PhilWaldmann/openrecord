/*
 * MODEL
 */
exports.model = {
  inspect: function(indent) {
    if (!this.definition) {
      return ''
    }

    indent = indent || 0
    var indentStr = ''
    var i

    for (i = 0; i < indent; i++) {
      indentStr += ' '
    }

    if (this.chained) {
      var tmp = '[\n'
      var records = []
      for (i = 0; i < this.length; i++) {
        records.push(this[i].inspect(indent + 2))
      }
      if (records.length === 0) {
        if (this._isResolved())
          return '<' + this.definition.modelName + ' [empty result]>'
        else return '<' + this.definition.modelName + ' [not loaded]>'
      }

      tmp += records.join(',\n')

      tmp += '\n' + indentStr + ']'

      return tmp
    }

    var attributes = []
    for (var name in this.definition.attributes) {
      if (this.definition.attributes.hasOwnProperty(name)) {
        attributes.push(this.definition.attributes[name].name)
      }
    }

    return '<' + this.definition.modelName + ' [' + attributes.join(', ') + ']>'
  }
}

exports.record = {
  inspect: function(indent, nested) {
    if (!this.model) {
      return ''
    }

    indent = indent || 0

    var tmp = ''
    var indentStr = ''
    var name
    var i

    for (i = 0; i < indent; i++) {
      indentStr += ' '
    }

    if (nested !== true) tmp += indentStr

    tmp += '<' + this.model.definition.modelName + ' {'

    var attributes = []
    for (name in this.attributes) {
      if (
        this.attributes.hasOwnProperty(name) &&
        this.definition.attributes[name] &&
        this.definition.attributes[name].hidden !== true
      ) {
        var value = this.attributes[name]
        if (value && typeof value.inspect === 'function')
          value = value.inspect()
        else value = JSON.stringify(value)
        attributes.push(this.definition.attributes[name].name + ':' + value)
      }
    }

    tmp += attributes.join(' ')

    var relations = []
    Object.keys(this.definition.relations).forEach(function(name) {
      const records = this['_' + name]
      const relation = this.definition.relations[name]
      if (records === null || records === undefined || (Array.isArray(records) && records.length === 0)) return

      var relationTxt = JSON.stringify(records)
      if (records.inspect)
        relationTxt = records.inspect(
          indent + 2,
          relation.type !== 'has_many' && relation.type !== 'belongs_to_many'
        )

      relations.push('\n  ' + indentStr + name + ': ' + relationTxt)
    }, this)

    if (relations.length > 0) {
      tmp += ','
    }
    tmp += relations.join(',')
    if (relations.length > 0) {
      tmp += '\n' + indentStr
    }

    tmp += '}>'

    return tmp
  }
}
