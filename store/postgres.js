const Store = require('../lib/store')

Store.registeredTypes.postgres = require('../lib/base').concat(
  require('../lib/stores/sql'),
  require('../lib/stores/postgres')
)

module.exports = function(config){
  config.type = 'postgres'
  return new Store(config)
}

module.exports.BaseModel = Store.BaseModel