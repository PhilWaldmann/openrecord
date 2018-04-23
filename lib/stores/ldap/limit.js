const ldap = require('ldapjs')

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.beforeFind(function(options) {
      var limit = this.getInternal('limit')
      // var offset = this.getInternal('offset') // not possible in ldap ?!

      if (typeof limit !== 'number') limit = 100
      options.controls = options.controls || []
      options.controls.push(
        new ldap.PagedResultsControl({ value: { size: limit } })
      )
    }, -40)
  }
}
