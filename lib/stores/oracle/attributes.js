/*
 * STORE
 */
exports.store = {
  loadTableAttributes: function(name) {
    return this.connection
      .raw(
        [
          'SELECT user_tab_columns.column_name, data_type, data_precision, data_scale, data_length, nullable, user_constraints.constraint_type',
          'FROM user_tab_columns',
          'LEFT JOIN user_cons_columns ON user_cons_columns.table_name = user_tab_columns.table_name AND user_cons_columns.column_name = user_tab_columns.column_name',
          'LEFT JOIN user_constraints ON user_constraints.constraint_name = user_cons_columns.constraint_name',
          "WHERE user_tab_columns.table_name = '" + name + "'",
          'ORDER BY user_tab_columns.COLUMN_ID'
        ].join(' ')
      )
      .then(function(result) {
        var attributes = []

        for (var i in result) {
          var attr = result[i]
          var attrDef = {
            name: result[i].COLUMN_NAME,
            type: simplifiedType(
              attr.DATA_TYPE,
              attr.DATA_PRECISION,
              attr.DATA_SCALE
            ),
            options: {
              description: null, // TODO in V2.1: use all_tab_comments ?!
              persistent: true,
              primary: result[i].CONSTRAINT_TYPE === 'P',
              notnull: result[i].NULLABLE !== 'Y',
              default: null, // result[i].Default,
              length: getMaxLength(attr.DATA_TYPE),
              writable: !(
                result[i].CONSTRAINT_TYPE === 'P' && result[i].NULLABLE === 'N'
              ) // set to false if primary and not null
            },
            validations: []
          }

          if (attrDef.options.notnull && !attrDef.options.primary) {
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

function simplifiedType(type, precision, scale) {
  type = type.replace(/\(.+\)/, '').toUpperCase()

  switch (type) {
    case 'NUMBER':
      if (precision && scale) return 'float'
      return 'integer'

    case 'CHAR':
      return 'boolean'

    case 'DATE':
      return 'date'

    case 'TIMESTAMP':
      return 'datetime'

    case 'BLOB':
      return 'binary'

    default:
      return 'string'
  }
}
