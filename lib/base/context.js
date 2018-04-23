/*
 * MODEL
 */
exports.model = {
  /**
   * Adds a context object to your Model which could be used by your Hooks, Validation or Events via `this.context`
   * This is especially usefull need to differentiate things based on e.g. the cookie. Just set the context to the current request (`Model.setContext(req).create(params))` and use `this.context` inside your `beforeCreate()` hook.
   * The `context` Variable is available on your Model an all it's Records.
   *
   * @class Model
   * @method setContext
   * @param {object} context - Your context object
   *
   * @return {Model}
   */
  setContext: function(context) {
    var self = this.chain()

    self.setInternal('context', context)

    return self
  }
}

/*
 * CHAIN
 */
exports.chain = {
  mixinCallback: function() {
    this.__defineGetter__('context', function() {
      const parentRecord = this.getInternal('relation_to')
      var context = this.getInternal('context')

      if (context) return context

      // otherwise ask it's parent record
      if (parentRecord) return parentRecord.context
    })
  }
}

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function() {
    this.__defineGetter__('context', function() {
      if (this.__chainedModel) return this.__chainedModel.context
    })
  }
}
