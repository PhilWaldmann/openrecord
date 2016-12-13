var ldap = require('ldapjs');

/*
 * STORE
 */
exports.store = {

  ldapjs: ldap,

  mixinCallback: function(){
    var self = this;

    self.connection = ldap.createClient({
      url: self.config.url,
      bindDN: self.config.user,
      bindCredentials: self.config.password,
      maxConnections: self.config.maxConnections || 10,
      tlsOptions: self.config.tlsOptions,
      reconnect: self.config.reconnect || true
    });

  },

  close: function(){
    this.connection.unbind();
  }
};


/*
 * CHAIN
 */
exports.model = {
  mixinCallback: function(){
    var self = this;
    this.__defineGetter__('connection', function(){
      return self.definition.store.connection;
    });
  }
};
