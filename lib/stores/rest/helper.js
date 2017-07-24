const url = require('url')


exports.utils = {
  applyParams: function(options, primaryKeys){
    var params = options.params
    var path = options.path

    path = options.path.replace(/:(\w+)/, function(match, param){
      if(params[param]){
        var tmp = params[param]
        delete params[param]
        return tmp
      }
      return match
    })

    options.path = url.format({
      pathname: path,
      query: params
    })
  }
}
