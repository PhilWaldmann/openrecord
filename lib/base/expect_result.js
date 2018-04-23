exports.store = {
  mixinCallback: function() {
    const Store = require('../store')

    Store.addExceptionType(function RecordNotFoundError(Model) {
      Error.apply(this)
      this.message = "Can't find any record for " + Model.definition.modelName
    })
  }
}

/*
 * MODEL
 */
exports.model = {
  /**
   * When called, it will throw an error if the resultset is empty
   * @class Model
   * @method expectResult
   *
   * @see Model.get
   *
   * @return {Model}
   */
  expectResult: function() {
    var self = this.chain()

    self.setInternal('expectResult', true)

    return self
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    const Store = require('../store')

    this.afterFind(function(data) {
      var expectResult = this.getInternal('expectResult')

      if (expectResult && (!data.result || data.result.length === 0)) {
        return Promise.reject(new Store.RecordNotFoundError(this))
      }
    }, 10)
  }
}
