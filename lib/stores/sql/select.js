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
    var self = this

    this.beforeFind(function(query) {
      const custom = this.getInternal('select')
      var select = []
      var star = true

      if (custom) {
        select = custom
        star = false

        var asJson = false

        select.forEach(function(field, index) {
          // check for function calls => don't escape them!
          if (field.match(/(\(|\))/)) {
            select[index] = self.store.connection.raw(field)
            asJson = true
          }
        })

        if (asJson) {
          this.asJson()
          this.asRaw()
        } else {
          this.setInternal('allowed_attributes', select)
        }
      }

      if (!star) {
        this.setInternal('has_selects', true)
        query.select(select)
      }

      return true
    }, -50)
  }
}
