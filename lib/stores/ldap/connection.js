const ldap = require('ldapjs')

/*
 * STORE
 */
exports.store = {

  ldapjs: ldap,

  connect: function(){
    if(this.connection) this.close()

    this.connection = ldap.createClient({
      url: this.config.url,
      bindDN: this.config.user,
      bindCredentials: this.config.password,
      maxConnections: this.config.maxConnections || 10,
      tlsOptions: this.config.tlsOptions,
      reconnect: this.config.reconnect || true
    })
  },

  close: function(){
    this.connection.unbind()
  }


}


/*
 * CHAIN
 */
exports.model = {
  mixinCallback: function(){
    var self = this
    this.__defineGetter__('connection', function(){
      return self.definition.store.connection
    })
  }
}
