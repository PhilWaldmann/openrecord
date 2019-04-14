/*
 * STORE
 */
exports.store = {
  loadTableAttributes: function(name) {
    return this.connection
      .raw('SHOW FULL COLUMNS FROM ' + name)
      .then(function(response) {
        var result = response[0]
        var attributes = []

        for (var i in result) {
          var attrDef = {
            name: result[i].Field,
            type: simplifiedType(result[i].Type),
            options: {
              description: result[i].Comment,
              persistent: true,
              primary: result[i].Key === 'PRI',
              notnull: result[i].Null !== 'YES',
              default: result[i].Default,
              length: getMaxLength(result[i].Type),
              writable: !(
                result[i].Key === 'PRI' && result[i].Extra === 'auto_increment'
              ) // set to false if primary and integer
            },
            validations: []
          }

          if (result[i].Null !== 'YES' && result[i].Key !== 'PRI') {
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
  if (type.toLowerCase() === 'tinyint(1)') type = 'boolean'
  type = type.replace(/\(.+\)/, '').toUpperCase()

  switch (type) {
    case 'BIGINT UNSIGNED':
    case 'INT UNSIGNED':
    case 'TINYINT':
    case 'INT':
      return 'integer'

    case 'FLOAT':
      return 'float'

    case 'BOOLEAN':
      return 'boolean'

    case 'DATE':
      return 'date'

    case 'TIME':
      return 'time'

    case 'DATETIME':
      return 'datetime'

    case 'BLOB':
      return 'binary'

    default:
      return 'string'
  }
}
