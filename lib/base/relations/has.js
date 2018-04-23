exports.definition = {
  has: function(name, options) {
    options = options || {}
    options.type = 'has'

    options.preInitialize = options.preInitialize || function() {}
    options.initialize = options.initialize || function() {}

    return this.relation(name, options)
  }
}
