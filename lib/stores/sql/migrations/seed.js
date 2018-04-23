exports.migration = {
  seed: function(fn) {
    return this.run(function() {
      return this.use(fn)
    })
  }
}
