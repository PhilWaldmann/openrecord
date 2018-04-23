/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    var self = this
    var connection
    var connectCalled = false

    // define setter and getter to manage the connection
    Object.defineProperty(this, 'connection', {
      enumerable: false,
      set: function(_connection) {
        if (connection) self.close() // close old connection before we overwrite it with a new one
        connection = _connection
      },

      get: function() {
        if (!connection && !connectCalled) {
          self.connect()
          connectCalled = true
        }
        return connection
      }
    })

    if (this.config.autoConnect !== false) {
      this.connect()
    }
  },

  connect: function() {},

  close: function() {}
}
