const inflection = require('inflection')

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.resource = inflection.underscore(inflection.pluralize(this.modelName))

    if (
      this.store.config.inflection &&
      this.store.config.inflection[this.resource]
    ) {
      this.resource = this.store.config.inflection[this.resource]
    }
  },

  getName: function() {
    return this.resource
  }
}

/*
 * STORE
 */
exports.store = {
  getByResource: function(resource) {
    for (var i in this.models) {
      if (this.models[i].definition.resource === resource) {
        return this.models[i]
      }
    }
  }
}
