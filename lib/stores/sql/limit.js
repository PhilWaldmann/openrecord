/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.beforeFind(function(query) {
      var limit = this.getInternal('limit')
      var offset = this.getInternal('offset')

      if (typeof limit === 'number') {
        query.limit(limit)
      }

      if (offset && offset > 0) {
        query.offset(offset)
      }

      return true
    }, -40)
  }
}
