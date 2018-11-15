const ldap = require('ldapjs')

/*
 * STORE
 */
exports.store = {
  ldapjs: ldap,

  connect: function() {
    this.connection = ldap.createClient(
      this.config.connection || {
        url: this.config.url,
        bindDN: this.config.user,
        bindCredentials: this.config.password,
        maxConnections: this.config.maxConnections || 10,
        tlsOptions: this.config.tlsOptions,
        reconnect: this.config.reconnect || true
      }
    )
  },

  close: function() {
    this.connection.unbind()
  }
}

/*
 * CHAIN
 */
exports.model = {
  mixinCallback: function() {
    var self = this
    this.__defineGetter__('connection', function() {
      return self.definition.store.connection
    })
  }
}
