/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.afterFind(function(data) {
      var records = data.result || []

      if (!Array.isArray(records)) {
        records = records[this.rootParam || 'data'] || []
      }

      if (records && !Array.isArray(records)) {
        records = [records] // Every result is an array...
      }

      data.result = records

      return true
    }, 100)
  }
}
