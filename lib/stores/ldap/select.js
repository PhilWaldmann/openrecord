/*
 * MODEL
 */
exports.model = {
  /**
   * Specify SQL select fields. Default: *
   * @class Model
   * @method select
   * @param {array} fields - The field names
   *
   *
   * @return {Model}
   */
  select: function() {
    var self = this.chain()

    var args = this.definition.store.utils.args(arguments)
    var fields = []
    fields = fields.concat.apply(fields, args) // flatten

    self.addInternal('select', fields)

    return self
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    // add all attribute names to the search attributes
    this.beforeFind(function(options) {
      var attributes = this.getInternal('select')
      if (attributes) options.attributes = attributes
    }, -100)
  }
}
