exports.store = {
  mixinCallback: function() {
    this.addType('integer_array', this.toArrayCastTypes('integer'), {
      array: true,
      migration: {
        integerArray: 'integer[]'
      },

      operators: {
        default: 'in',
        in: {
          defaultMethod: function(attr, value, query, cond) {
            query.whereRaw(attr + ' @> ARRAY[?]::integer[]', [value])
          },

          nullifyEmptyArray: true,
          on: {
            all: false,
            number: true,
            string: true,
            array: function(attr, value, query, cond) {
              value = value.map(function(i) {
                return parseInt(i, 10)
              })
              query.whereRaw(attr + ' && ?::integer[]', [value])
            },
            attribute: function(attr, value, query, cond) {
              query.whereRaw(attr + ' @> ARRAY[' + value + ']::integer[]')
            },
            attribute_array: function(attr, value, query, cond) {
              query.whereRaw(attr + ' && ' + value)
            }
          }
        }
      }
    })
  }
}
