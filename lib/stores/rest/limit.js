/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.beforeFind(function(options) {
      var limit = this.getInternal('limit')
      var offset = this.getInternal('offset')

      if (limit) {
        options.params.limit = limit
      }

      if (offset) {
        options.params.limit = offset
      }

      return true
    }, -40)
  }
}
