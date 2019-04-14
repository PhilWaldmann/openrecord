/*
 * STORE
 */
exports.store = {
  loadTableAttributes: function(name) {
    return this.connection
      .raw("PRAGMA table_info('" + name + "')")
      .then(function(result) {
        var attributes = []
        for (var i in result) {
          var _default = result[i].dflt_value
          if (_default) _default = _default.replace(/(^'|'$)/g, '')

          var attrDef = {
            name: result[i].name,
            type: simplifiedType(result[i].type),
            options: {
              description: null, // TODO
              persistent: true,
              primary: result[i].pk !== 0,
              notnull: result[i].notnull === 1,
              default: _default,
              length: getMaxLength(result[i].type),
              writable: !(
                result[i].pk !== 0 && result[i].type.toLowerCase() === 'integer'
              ) // set to false if primary and integer
            },
            validations: []
          }

          if (result[i].notnull === 1 && result[i].pk === 0) {
            attrDef.validations.push({ name: 'validatesPresenceOf', args: [] })
          }
          attributes.push(attrDef)
        }

        return attributes
      })
  }
}

function getMaxLength(type) {
  var len = type.match(/\((\d+)\)/)
  if (len) {
    len = parseInt(len[1])

    if (len > 1) {
      return len
    }
  }
  return null
}

function simplifiedType(type) {
  type = type.replace(/\(.+\)/, '').toUpperCase()
  switch (type) {
    case 'INT':
    case 'INTEGER':
    case 'TINYINT':
    case 'SMALLINT':
    case 'MEDIUMINT':
    case 'BIGINT':
    case 'UNSIGNED BIG INT':
    case 'INT2':
    case 'INT8':
      return 'integer'

    case 'REAL':
    case 'DOUBLE':
    case 'DOUBLE PRECISION':
    case 'FLOAT':
    case 'NUMERIC':
    case 'DECIMAL':
      return 'float'

    case 'BOOLEAN':
      return 'boolean'

    case 'DATE':
      return 'date'

    case 'DATETIME':
      return 'datetime'

    default:
      return 'string'
  }
}
