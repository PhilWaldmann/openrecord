/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.cache = this.store.getCache(this.modelName) || {}
    if (this.cacheDisabled !== true)
      this.store.setCache(this.modelName, this.cache)
  },

  getCache: function(key) {
    return this.store.utils.clone(this.cache[key])
  },

  setCache: function(key, cache) {
    this.cache[key] = this.store.utils.clone(cache)
  }
}

/*
 * STORE
 */
exports.store = {
  getCache: function(modelName) {
    if (this.cache && this.cache[modelName]) {
      return this.cache[modelName]
    }
  },

  setCache: function(modelName, cache) {
    if (!this.cache) this.cache = {}
    this.cache[modelName] = cache
  }
}
