const inflection = require('inflection')

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.tableName = inflection.underscore(inflection.pluralize(this.modelName))

    if (
      this.store.config.inflection &&
      this.store.config.inflection[this.tableName]
    ) {
      this.tableName = this.store.config.inflection[this.tableName]
    }
  },

  getName: function() {
    return this.tableName
  }
}

/*
 * STORE
 */
exports.store = {
  getByTableName: function(tableName) {
    for (var i in this.models) {
      if (this.models[i].definition.tableName === tableName) {
        return this.models[i]
      }
    }
  }
}
