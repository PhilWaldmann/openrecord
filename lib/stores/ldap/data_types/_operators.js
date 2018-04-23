const ldap = require('ldapjs')

/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    this.addOperator(
      'eq',
      function(attr, value, options) {
        options.filter.filters.push(
          new ldap.EqualityFilter({ attribute: attr, value: value })
        )
      },
      {
        default: true,
        nullifyEmptyArray: true,
        on: {
          null: function(attr, value, options) {
            options.filter.filters.push(
              new ldap.NotPresenceFilter({ attribute: attr })
            )
          },
          array: function(attr, values, options) {
            options.filter.filters.push(
              new ldap.EqualityInFilter({ attribute: attr, values: values })
            )
          },
          binary: function(attr, value, options) {
            value = this.definition.cast(attr, value, 'write', this)
            options.filter.filters.push(
              new ldap.EqualityFilter({ attribute: attr, value: value })
            )
          }
        }
      }
    )

    this.addOperator(
      'not',
      function(attr, value, options) {
        options.filter.filters.push(
          new ldap.NotFilter({
            filter: new ldap.EqualityFilter({ attribute: attr, value: value })
          })
        )
      },
      {
        nullifyEmptyArray: true,
        on: {
          null: function(attr, value, options) {
            options.filter.filters.push(
              new ldap.NotFilter({
                filter: new ldap.NotPresenceFilter({ attribute: attr })
              })
            )
          },
          array: function(attr, values, options) {
            options.filter.filters.push(
              new ldap.NotFilter({
                filter: new ldap.EqualityInFilter({
                  attribute: attr,
                  values: values
                })
              })
            )
          }
        }
      }
    )

    this.addOperator(
      'like',
      function(attr, value, options) {
        options.filter.filters.push(
          new ldap.SubstringFilter({ attribute: attr, any: [value] })
        )
      },
      {
        nullifyEmptyArray: true,
        on: {
          null: function(attr, value, options) {
            options.filter.filters.push(
              new ldap.NotPresenceFilter({ attribute: attr })
            )
          },
          array: function(attr, values, options) {
            options.filter.filters.push(
              new ldap.SubstringInFilter({ attribute: attr, values: values })
            )
          }
        }
      }
    )

    this.addOperator(
      'gt',
      function(attr, value, options) {
        options.filter.filters.push(
          new ldap.GreaterThanFilter({
            attribute: attr,
            value: value.toString()
          })
        )
        options.filter.filters.push(
          new ldap.NotFilter({
            filter: new ldap.NotPresenceFilter({ attribute: attr })
          })
        )
      },
      {
        on: {
          all: false,
          number: true,
          date: true
        }
      }
    )

    this.addOperator(
      'gte',
      function(attr, value, options) {
        options.filter.filters.push(
          new ldap.GreaterThanEqualsFilter({
            attribute: attr,
            value: value.toString()
          })
        )
        options.filter.filters.push(
          new ldap.NotFilter({
            filter: new ldap.NotPresenceFilter({ attribute: attr })
          })
        )
      },
      {
        on: {
          all: false,
          number: true,
          date: true
        }
      }
    )

    this.addOperator(
      'lt',
      function(attr, value, options) {
        options.filter.filters.push(
          new ldap.OrFilter({
            filters: [
              new ldap.LessThanFilter({
                attribute: attr,
                value: value.toString()
              }),
              new ldap.NotPresenceFilter({ attribute: attr })
            ]
          })
        )
      },
      {
        on: {
          all: false,
          number: true,
          date: true
        }
      }
    )

    this.addOperator(
      'lte',
      function(attr, value, options) {
        options.filter.filters.push(
          new ldap.OrFilter({
            filters: [
              new ldap.LessThanEqualsFilter({
                attribute: attr,
                value: value.toString()
              }),
              new ldap.NotPresenceFilter({ attribute: attr })
            ]
          })
        )
      },
      {
        on: {
          all: false,
          number: true,
          date: true
        }
      }
    )

    this.addOperator(
      'between',
      function(attr, values, options) {
        options.filter.filters.push(
          new ldap.BetweenFilter({ attribute: attr, value: values })
        )
      },
      {
        on: {
          all: false,
          array: true
        }
      }
    )

    this.attributeTypes[String].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq'],
      not: this.operatorTypes['not'],
      like: this.operatorTypes['like']
    }

    this.attributeTypes[Number].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq'],
      not: this.operatorTypes['not'],
      gt: this.operatorTypes['gt'],
      gte: this.operatorTypes['gte'],
      lt: this.operatorTypes['lt'],
      lte: this.operatorTypes['lte'],
      between: this.operatorTypes['between']
    }

    this.attributeTypes[Date].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq'],
      not: this.operatorTypes['not'],
      gt: this.operatorTypes['gt'],
      gte: this.operatorTypes['gte'],
      lt: this.operatorTypes['lt'],
      lte: this.operatorTypes['lte'],
      between: this.operatorTypes['between']
    }

    this.attributeTypes[Boolean].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq'],
      not: this.operatorTypes['not']
    }
  }
}

// inverse of presence filter
ldap.NotPresenceFilter = function(config) {
  if (!config) return
  return new ldap.NotFilter({
    filter: new ldap.PresenceFilter({ attribute: config.attribute })
  })
}

// between filter
ldap.BetweenFilter = function(config) {
  if (!config) return
  return new ldap.AndFilter({
    filters: [
      new ldap.GreaterThanEqualsFilter({
        attribute: config.attribute,
        value: config.value[0].toString()
      }),
      new ldap.LessThanEqualsFilter({
        attribute: config.attribute,
        value: config.value[1].toString()
      })
    ]
  })
}

// equality filter but with multiple values (value1 or value2 or value3 ...)
ldap.EqualityInFilter = function(config) {
  if (!config) return
  var tmp = []

  for (var i = 0; i < config.values.length; i++) {
    tmp.push(
      new ldap.EqualityFilter({
        attribute: config.attribute,
        value: config.values[i]
      })
    )
  }

  return new ldap.OrFilter({
    filters: tmp
  })
}

// substring filter but with multiple values (value1 or value2 or value3 ...)
ldap.SubstringInFilter = function(config) {
  if (!config) return
  var tmp = []

  for (var i = 0; i < config.values.length; i++) {
    tmp.push(
      new ldap.SubstringFilter({
        attribute: config.attribute,
        any: [config.values[i]]
      })
    )
  }

  return new ldap.OrFilter({
    filters: tmp
  })
}

// greater than filter
ldap.GreaterThanFilter = function(config) {
  if (!config) return
  return new ldap.NotFilter({
    filter: new ldap.LessThanEqualsFilter({
      attribute: config.attribute,
      value: config.value
    })
  })
}

// less than filter
ldap.LessThanFilter = function(config) {
  if (!config) return
  return new ldap.NotFilter({
    filter: new ldap.GreaterThanEqualsFilter({
      attribute: config.attribute,
      value: config.value
    })
  })
}
