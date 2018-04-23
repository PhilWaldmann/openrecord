const ldap = require('ldapjs')
/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    this.addType(
      'guid',
      {
        read: function(value) {
          const data = Buffer.from(value, 'binary')
          var template =
            '{3}{2}{1}{0}-{5}{4}-{7}{6}-{8}{9}-{10}{11}{12}{13}{14}{15}'

          for (var i = 0; i < data.length; i++) {
            var dataStr = data[i].toString(16)
            dataStr = data[i] >= 16 ? dataStr : '0' + dataStr
            template = template.replace(
              new RegExp('\\{' + i + '\\}', 'g'),
              dataStr
            )
          }
          return template
        },

        write: function(value) {
          if (!value) return null

          value = value.replace(
            /(.{2})(.{2})(.{2})(.{2})-(.{2})(.{2})-(.{2})(.{2})-(.{2})(.{2})-(.{12})/,
            '$4$3$2$1$6$5$8$7$9$10$11'
          )

          if (Buffer.from) return Buffer.from(value, 'hex')
          return new Buffer(value, 'hex') // eslint-disable-line node/no-deprecated-api
          // return value; //not yet supported by ldapjs
          // return '\\' + value.toString('hex').match(/.{2}/g).join('\\')
        }
      },
      {
        binary: true,
        operators: {
          defaults: ['eq'],
          eq: {
            defaultMethod: function(attr, value, options) {
              value = this.definition.cast(attr, value, 'write', this)
              options.filter.filters.push(
                new ldap.EqualityFilter({ attribute: attr, value: value })
              )
            },

            on: {
              all: true
            }
          }
        }
      }
    )
  }
}
