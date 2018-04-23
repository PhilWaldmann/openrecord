const debug = require('debug')('openrecord:exec')

exports.definition = {
  mixinCallback: function() {
    var self = this

    this.onFind(function(options, data) {
      self.store.utils.applyParams(options)
      return this.connection.request(options).then(function(result) {
        debug(options.method + ' ' + options.url)
        data.result = result.data
      })
    })
  }
}

/*
 * MODEL
 */
exports.model = {
  getExecOptions: function() {
    var action = this.getInternal('action') || 'index'
    return this.definition.store.utils.clone(this.definition.actions[action])
  }
}
