exports.migration = {
  polymorph: function(name) {
    this.integer(name + '_id')
    this.string(name + '_type')
  }
}
