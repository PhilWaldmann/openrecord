const Store = require('../lib/store')

Store.registeredTypes.sql = require('../lib/base').concat(
  require('../lib/stores/sql')
)

module.exports = function(config){
  config.type = 'sql'
  return new Store(config)
}

module.exports.BaseModel = Store.BaseModel