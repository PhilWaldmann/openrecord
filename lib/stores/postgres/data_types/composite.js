exports.store = {
  mixinCallback: function() {
    this.addType('composite', {
      input: function(val, attribute) {
        if (val instanceof Object)
          return this.definition.attributes[attribute].dynamicType.new(val)
        return val
      },

      read: function(val, attribute) {
        if (val instanceof Object) return val
        return parse(val, this.definition.attributes[attribute], true)
      },

      write: function(object, attribute) {
        if (object === null) return null
        if (typeof object === 'string') return object

        return format(object, this.definition.attributes[attribute])
      }
    })
  }
}

function parse(str, def, existing) {
  var result = {}
  if (str) {
    var parts = []

    var insideQuote = false
    var lastEnd = 0
    for (var i = 0; i < str.length; i++) {
      if (insideQuote) {
        if (str[i] === '"' && str[i + 1] === '"') {
          // found a escaped quote
          i++
          continue
        }

        if (str[i] === '"') {
          // found the end of an item
          parts.push(str.substring(lastEnd, i))
          i++
          lastEnd = i + 1
          insideQuote = false
          continue
        }
      } else {
        if (str[i] === '(') {
          // found start sequence
          lastEnd = i + 1
          continue
        }

        if (str[i] === '"') {
          // found the start of an item
          insideQuote = true
          lastEnd = i + 1
          continue
        }

        if (str[i] === ',') {
          // found next item start
          parts.push(str.substring(lastEnd, i))
          lastEnd = i + 1
        }
        if (str[i] === ')' && str[i - 1] !== '"') {
          // found end sequence
          parts.push(str.substring(lastEnd, i))
        }
      }
    }

    def.attributes.forEach(function(attr, index) {
      if (parts[index]) result[attr] = parts[index].replace(/""/g, '"')
      // replace double quotes - escaped by postgres
      else result[attr] = parts[index]
    })
  }

  const record = def.dynamicType.new(result)
  if (existing) record._exists()

  return record
}

function format(data, def) {
  var result = []

  def.attributes.forEach(function(attr) {
    if (data[attr]) {
      if (typeof data[attr] === 'string') {
        // TODO: V2.1. typecast?!
        result.push('"' + data[attr].toString().replace(/"/g, '""') + '"')
      } else {
        result.push(data[attr])
      }
    } else {
      result.push('')
    }
  })

  return '(' + result.join(',') + ')'
}
