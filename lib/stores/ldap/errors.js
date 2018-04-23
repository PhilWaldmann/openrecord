const ldap = require('ldapjs')

exports.store = {
  mixinCallback: function() {
    var self = this

    self.ldap_errors = []
    self.connection.on('error', function(err) {
      throw err
    })
  },

  addLdapValidationError: function(errorType, msgMatch, attribute, error) {
    if (ldap[errorType]) {
      this.ldap_errors.push({
        cls: ldap[errorType],
        match: msgMatch,
        attribute: attribute,
        error: error
      })
    }
  },

  convertLdapErrorToValidationError: function(record, error) {
    for (var i = 0; i < this.ldap_errors.length; i++) {
      // check error class
      if (error instanceof this.ldap_errors[i].cls) {
        // check message match
        if (error.message.match(this.ldap_errors[i].match)) {
          // add validation error + return null to avoid promise rejection
          record.errors.add(
            this.ldap_errors[i].attribute,
            this.ldap_errors[i].error
          )
          return record.errors
        }
      }
    }

    return error
  }
}
