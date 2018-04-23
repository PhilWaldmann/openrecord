const axios = require('axios')

/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    this.connection = axios.create(
      Object.assign(
        {
          baseURL: this.config.baseUrl || this.config.url
        },
        this.config
      )
    )
  },

  close: function(callback) {
    callback()
  }
}

/*
 * CHAIN
 */
exports.model = {
  mixinCallback: function() {
    var self = this
    this.__defineGetter__('connection', function() {
      return self.definition.store.connection
    })
  }
}
