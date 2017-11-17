const fs = require('fs')

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.cache = this.store.getCache(this.model_name) || {}
    if(this.cacheDisabled !== true) this.store.setCache(this.model_name, this.cache)
  },

  getCache: function(key){
    return this.store.utils.clone(this.cache[key])
  },

  setCache: function(key, cache){
    this.cache[key] = this.store.utils.clone(cache)
  }
}


/*
 * STORE
 */
exports.store = {
  getCache: function(modelName){
    if(this.cache && this.cache[modelName]){
      return this.cache[modelName]
    }
  },

  setCache: function(modelName, cache){
    if(!this.cache) this.cache = {}
    this.cache[modelName] = cache
  },

  saveCache: function(filePath){
    fs.writeSync(filePath, JSON.stringify(this.cache))
  }
}
