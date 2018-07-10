/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.default_scopes = []

    this.beforeFind(function() {
      return this.runScopes()
    }, 200)
  },


  /**
   * scope callback function
   *
   * @public
   * @callback scopeFN
   * @param {*} args - All caller arguments
   * @return *
   * @this Model
   */

  /**
   * Creates a custom chained Model method
   *
   * @public
   * @memberof Definition
   * @method scope
   * @param {string} name - The name of the scope
   * @param {scopeFN} callback - The scope function
   * @return {Definition}
   *
   */
  scope: function(name, fn, lazy) {
    const Utils = this.store.utils

    if (!fn && this.model) fn = this.model[name]
    if (!fn)
      throw new Error('You need to provide a function in order to use a scope')

    var tmp = function() {
      var args = Utils.args(arguments)
      const self = this.chain()._unresolve() // if the collection is already resolved, return a unresolved and empty copy!

      if (lazy) {
        self.addInternal('active_scopes', function() {
          return fn.apply(this, args)
        })
      } else {
        fn.apply(self, args)
      }

      return self
    }

    this.staticMethods[name] = tmp

    return this
  },

  /**
   * Adds a default scope
   *
   * @class Definition
   * @method defaultScope
   * @param {string} name - The name of the scope
   *
   * @return {Definition}
   */
  defaultScope: function(name) {
    this.default_scopes.push(name)
    return this
  }
}

exports.model = {
  runScopes: function() {
    if (!this.chained) return Promise.resolve() // if not a chain, there are no scopes called

    var self = this

    var scopesFns = (self.getInternal('active_scopes') || []).map(function(fn) {
      return fn.bind(self)
    })

    return self.store.utils.parallel(scopesFns).then(function() {
      self.clearInternal('active_scopes')
    })
  },

  callDefaultScopes: function() {
    var calledScopes = []

    if (this.chained) {
      calledScopes = this.getInternal('called_scopes') || []
    }

    for (var i = 0; i < this.definition.default_scopes.length; i++) {
      var scope = this.definition.default_scopes[i]

      if (
        typeof this[scope] === 'function' &&
        calledScopes.indexOf(scope) === -1
      ) {
        this[scope](this)
        calledScopes.push(scope)
      }
    }

    if (this.chained) {
      this.setInternal('called_scopes', calledScopes)
    }

    return this
  }
}
