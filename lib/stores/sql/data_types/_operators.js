exports.store = {
  mixinCallback: function() {
    // EQUAL OPERATOR (=, is null)
    this.addOperator(
      'eq',
      function(attr, value, query, cond) {
        query.where(attr, '=', value)
      },
      {
        default: true,
        nullifyEmptyArray: true,
        on: {
          array: function(attr, value, query, cond) {
            query.whereIn(attr, value)
          },

          null: function(attr, value, query, cond) {
            query.whereNull(attr)
          },

          attribute: function(attr, value, query, cond) {
            // TODO: same for other operators?!
            query.whereRaw(
              this.escapeAttribute(attr) + ' = ' + this.escapeAttribute(value)
            )
          },

          attribute_array: function(attr, value, query, cond) {
            query.whereRaw(
              this.escapeAttribute(attr) +
                ' = ANY(' +
                this.escapeAttribute(value) +
                ')'
            )
          }
        }
      }
    )

    // NOT OPERATOR (!=, is not null)
    this.addOperator(
      'not',
      function(attr, value, query, cond) {
        query.where(attr, '!=', value)
      },
      {
        nullifyEmptyArray: true,
        on: {
          array: function(attr, value, query, cond) {
            query.whereNotIn(attr, value)
          },

          null: function(attr, value, query, cond) {
            query.whereNotNull(attr)
          }
        }
      }
    )

    // GREATER THAN OPERATOR (>)
    this.addOperator(
      'gt',
      function(attr, value, query, cond) {
        query.where(attr, '>', value)
      },
      {
        on: {
          array: false // TODO: multiple orWhere() ??
        }
      }
    )

    // GREATER THAN EQUAL OPERATOR (>=)
    this.addOperator(
      'gte',
      function(attr, value, query, cond) {
        query.where(attr, '>=', value)
      },
      {
        on: {
          array: false // TODO: multiple orWhere() ??
        }
      }
    )

    // LOWER THAN OPERATOR (<)
    this.addOperator(
      'lt',
      function(attr, value, query, cond) {
        query.where(attr, '<', value)
      },
      {
        on: {
          array: false // TODO: multiple orWhere() ??
        }
      }
    )

    // LOWER THAN EQUAL OPERATOR (<=)
    this.addOperator(
      'lte',
      function(attr, value, query, cond) {
        query.where(attr, '<=', value)
      },
      {
        on: {
          array: false // TODO: multiple orWhere() ??
        }
      }
    )

    // BETWEEN OPERATOR (between)
    this.addOperator(
      'between',
      function(attr, values, query, cond) {
        if (Array.isArray(values[0])) {
          query.where(function() {
            for (var i = 0; i < values.length; i++) {
              this.orWhereBetween(attr, values[i])
            }
          })
        } else {
          query.whereBetween(attr, values)
        }
      },
      {
        on: {
          all: false,
          array: true
        }
      }
    )

    // LIKE OPERATOR (like)
    this.addOperator(
      'like',
      function(attr, value, query, cond) {
        query.where(attr, 'like', '%' + value + '%')
      },
      {
        on: {
          all: false,
          string: true,
          array: function(attr, values, query, cond) {
            query.where(function() {
              for (var i = 0; i < values.length; i++) {
                this.orWhere(attr, 'like', '%' + values[i] + '%')
              }
            })
          }
        }
      }
    )

    // iLIKE OPERATOR (ilike)
    this.addOperator(
      'ilike',
      function(attr, value, query, cond) {
        query.where(attr, 'ilike', '%' + value + '%')
      },
      {
        on: {
          all: false,
          string: true,
          array: function(attr, values, query, cond) {
            query.where(function() {
              for (var i = 0; i < values.length; i++) {
                this.orWhere(attr, 'ilike', '%' + values[i] + '%')
              }
            })
          }
        }
      }
    )
  }
}
