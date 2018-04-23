exports.utils = {
  applyParams: function(options, primaryKeys) {
    var params = options.params

    options.url = options.url.replace(/:(\w+)/, function(match, param) {
      if (params[param]) {
        var tmp = params[param]
        delete params[param]
        return tmp
      }
      return match
    })
  }
}
