exports.migration = {
  raw: function(sql) {
    var self = this

    this.queue.push(function() {
      return self.connection.raw(sql)
    })

    return this
  }
}
