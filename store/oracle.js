const Store = require('../lib/store')

Store.registeredTypes.oracle = require('../lib/base').concat(
  require('../lib/stores/sql'),
  require('../lib/stores/oracle')
)

module.exports = function(config){
  config.type = 'oracle'
  return new Store(config)
}

module.exports.BaseModel = Store.BaseModel