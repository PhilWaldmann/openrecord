exports.store = {

  mixinCallback: function(){
    this.addType('composite', {
      output: function(val, attribute){
        if(!val) return this.definition.attributes[attribute].Type.new()
        return val
      },

      input: function(val, attribute){
        if(val instanceof Object) return this.definition.attributes[attribute].Type.new(val)
        return val
      },

      read: function(val, attribute){
        if(val instanceof Object) return val
        if(val === null) return null

        return parse(val, this.definition.attributes[attribute], true)
      },

      write: function(object, attribute){
        if(object === null) return null
        if(typeof object === 'string') return object

        return format(object, this.definition.attributes[attribute])
      }
    })
  }
}


function parse(str, def, existing){
  var result = {}
  var parts = str.replace(/(^\(|\)$)/g, '').split(',')

  def.attributes.forEach(function(attr, index){
    result[attr] = parts[index]
  })

  const record = def.Type.new(result)
  if(existing) record._exists()

  return record
}


function format(data, def){
  var result = []

  def.attributes.forEach(function(attr){
    result.push(data[attr])
  })

  return '(' + result.join(',') + ')'
}
