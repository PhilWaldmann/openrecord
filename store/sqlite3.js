const Store = require('../lib/store')

Store.registeredTypes.sqlite3 = require('../lib/base').concat(
  require('../lib/stores/sql'),
  require('../lib/stores/sqlite3')
)

module.exports = function(config){
  config.type = 'sqlite3'
  return new Store(config)
}

module.exports.BaseModel = Store.BaseModel