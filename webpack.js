const Store = require('./store')
const webpack = require('webpack')

function OpenRecordCachePlugin(options) {
  this.stores = options
  if(!(options instanceof Array)) this.stores = [options]
}

OpenRecordCachePlugin.prototype.apply = function(compiler) {
  this.stores.forEach(function(config){
    compiler.plugin('make', function(compilation, callback){
      console.log(webpack)
      compilation.addEntry(this.context, 'FOOBAR', 'openrecord_cache', callback)
    })

    compiler.plugin('emit', function(compilation, callback) {
      delete config.cache

      var store = config
      if(!(config instanceof Store)) store = new Store(config)

      store.ready(function(){
        // console.log(compilation.assets)
        callback()
      })
    })
  })
}

module.exports = OpenRecordCachePlugin
