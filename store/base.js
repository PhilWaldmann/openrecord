const Store = require('../lib/store')

Store.registeredTypes.base = require('../lib/base')

module.exports = function(config){
  config = config || {}
  config.type = 'base'
  return new Store(config)
}

module.exports.BaseModel = Store.BaseModel
