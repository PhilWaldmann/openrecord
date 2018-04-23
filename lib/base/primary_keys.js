/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    var self = this

    this.primaryKeys = []

    this.use(function() {
      for (var name in self.attributes) {
        if (self.attributes[name].primary) {
          self.primaryKeys.push(name)
        }
      }
    }, 0)
  }
}
