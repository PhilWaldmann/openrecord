const glob = require('glob')

exports.utils = {
  require: function(path, options) {
    if (!options) options = {}
    if (!Array.isArray(path)) path = [path]

    var files = []
    var tmp = []
    var i

    if (options.includePathNames === true) {
      tmp = {}
    }

    for (i in path) {
      var f = glob.sync(path[i], options)
      if (f.length === 0 && !path[i].match(/[/\\]/)) f = [path[i]]
      files = files.concat(f)
    }

    for (i in files) {
      try {
        var plugin = require(files[i])
      } catch (e) {
        throw new Error(
          'File not found: ' +
            files[i] +
            '. If you use webpack or a similar bundler, make sure that plugins aren\'t loaded via a path, but with require("path")'
        )
      }
      if (options.only) plugin = plugin[options.only]

      if (plugin) {
        if (options.includePathNames === true) {
          tmp[files[i]] = plugin
        } else {
          tmp.push(plugin)
        }
      }
    }

    return tmp
  }
}
