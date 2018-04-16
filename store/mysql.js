const Store = require('../lib/store')

Store.registeredTypes.mysql = require('../lib/base').concat(
  require('../lib/stores/sql'),
  require('../lib/stores/mysql')
)

module.exports = function(config){
  config.type = 'mysql'
  return new Store(config)
}

module.exports.BaseModel = Store.BaseModel