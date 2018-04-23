exports.migration = {
  run: function(fn) {
    var self = this
    this.queue.push(function() {
      return fn.call(self.store)
    })

    return this
  }
}
