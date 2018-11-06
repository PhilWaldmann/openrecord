exports.migration = {
  raw: function(sql, args) {
    var self = this

    this.queue.push(function() {
      return self.connection.raw(sql, args)
    })

    return this
  }
}
