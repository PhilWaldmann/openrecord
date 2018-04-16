const Store = require('../lib/store')

Store.registeredTypes.ldap = require('../lib/base').concat(
  require('../lib/stores/ldap')
)

module.exports = function(config){
  config.type = 'ldap'
  return new Store(config)
}

module.exports.BaseModel = Store.BaseModel