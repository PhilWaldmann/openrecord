exports.store = {
  mixinCallback: function() {
    var store = this

    this.addType(
      'hstore',
      {
        output: function(val) {
          if (!val) return {}
          return val
        },

        read: function(val) {
          if (val instanceof Object) return val
          if (val === null) return null

          var tmp = null

          try {
            tmp = parse(val)
          } catch (e) {
            return null
          }

          for (var key in tmp) {
            if (
              tmp.hasOwnProperty(key) &&
              typeof tmp[key] === 'string' &&
              tmp[key].match(/(^\{"|\[)/)
            ) {
              try {
                tmp[key] = JSON.parse(tmp[key])
              } catch (e) {}
            }
          }

          return tmp
        },

        write: function(object) {
          if (object === null) return null
          if (typeof object === 'string') return object

          object = store.utils.clone(object)

          for (var key in object) {
            if (
              object.hasOwnProperty(key) &&
              object[key] &&
              typeof object[key] === 'object'
            ) {
              object[key] = JSON.stringify(object[key])
            }
          }

          return stringify(object)
        }
      },
      {
        migration: ['hstore'],
        operators: {
          defaults: ['eq', 'not']
        },

        sorter: function(name) {
          var tmp = name.match(/(.+)\.([a-zA-Z_-]+)$/)
          if (tmp) {
            return store.connection.raw(tmp[1] + "->'" + tmp[2] + "'")
          }
          return name
        }
      }
    )
  }
}

// https://github.com/scarney81/pg-hstore

function sanitizeInput(input) {
  // http://www.postgresql.org/docs/9.0/static/sql-syntax-lexical.html [4.1.2.1-4.1.2.2]
  // single quotes (') must be replaced with double single quotes ('')
  input = input.replace(/'/g, "''")
  // backslashes (\) must be replaced with double backslashes (\\)
  input = input.replace(/\\/g, '\\\\')
  // double quotes (") must be replaced with escaped quotes (\\")
  input = input.replace(/"/g, '\\"')
  return input
}

function toString(input, sanitize) {
  if (input === null) return null
  switch (typeof input) {
    case 'boolean':
    case 'number':
    case 'object':
      return String(input)
    case 'string':
      return sanitizeInput(input)
    default:
      return ''
  }
}

function stringify(data, callback) {
  var hstore = Object.keys(data).map(function(key) {
    if (data[key] === null) {
      return '"' + toString(key) + '"=>NULL'
    } else {
      return '"' + toString(key) + '"=>"' + toString(data[key]) + '"'
    }
  })
  var joined = hstore.join()
  if (!callback || callback === null) return joined
  callback(joined)
}

function parse(string, callback) {
  var result = {}
  // using [\s\S] to match any character, including line feed and carriage return,
  var r = /(["])(?:\\\1|\\\\|[\s\S])*?\1|NULL/g // lgtm [js/redos]
  var matches = string.match(r)
  var i
  var l

  var clean = function(value) {
    // Remove leading double quotes
    value = value.replace(/^"|"$/g, '')
    // Unescape quotes
    value = value.replace(/\\"/g, '"')
    // Unescape backslashes
    value = value.replace(/\\\\/g, '\\')
    // Unescape single quotes
    value = value.replace(/''/g, "'")

    if (value === 'NULL') return null
    if (value === 'true') return true
    if (value === 'false') return false
    if (value.match(/^[1-9]\d*$/)) return parseInt(value, 10)
    if (value === '0') return 0
    return value
  }

  if (matches) {
    for (i = 0, l = matches.length; i < l; i += 2) {
      var key = clean(matches[i])
      var value = matches[i + 1]
      result[key] = clean(value)
    }
  }

  if (!callback || callback === null) return result
  callback(result)
}
