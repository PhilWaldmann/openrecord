exports.definition = {
  mixinCallback: function() {
    var self = this
    self.ChainGenerator = null

    this.on('finished', function() {
      var Chain = function() {}
      Chain.prototype = [] // Chain is an array to hold all records

      // Array.find() interference with our own find method - when called via callParent()
      // so, the current solution is to null it!
      Chain.prototype.find = null

      var ChainModelMethods = {
        setInternal: function(name, value) {
          this._internal_attributes[name] = value
        },

        getInternal: function(name) {
          return this._internal_attributes[name]
        },

        clearInternal: function(name) {
          this._internal_attributes[name] = null
        },

        addInternal: function(name, value) {
          this._internal_attributes[name] =
            this._internal_attributes[name] || []
          if (Array.isArray(value)) {
            const tmp = this._internal_attributes[name]
            this._internal_attributes[name] = tmp.concat(value)
          } else {
            this._internal_attributes[name].push(value)
          }
        },

        definition: self,
        model: self.model,
        store: self.store,
        chained: true
      }

      self.store.utils.mixin(Chain.prototype, ChainModelMethods, {
        enumerable: false
      })
      self.store.utils.mixin(Chain.prototype, self.model, { enumerable: false })
      self.store.utils.mixin(Chain.prototype, self.store.mixinPaths, {
        only: 'chain',
        enumerable: false
      })

      self.ChainGenerator = function(options) {
        var arr = []
        Object.setPrototypeOf(arr, Chain.prototype)
        arr.options = options || {}
        arr._internal_attributes = {}

        self.store.utils.mixinCallbacks(arr)

        return arr
      }
    })
  }
}

/*
 * MODEL
 */
exports.model = {
  /**
   * Returns a Collection, which is in fact a cloned Model - or a chained Model
   * A Collectioin is an Array with all of Models' methods. All `where`, `limit`, `setContext`, ... information will be stored in this chained Model to allow asynchronous usage.
   *
   * @class Model
   * @method chain
   * @param {object} options - The options hash
   * @param {boolean} options.clone - Clone a existing chained object. Default: false
   *
   * @return {Collection}
   */
  chain: function(options) {
    options = options || {}
    if (this.chained && options.clone !== true) return this

    var ChainModel = new this.definition.ChainGenerator(options)

    if (this.chained && options.clone === true) {
      ChainModel._internal_attributes = this.definition.store.utils.clone(
        this._internal_attributes,
        options.exclude
      )
      ChainModel._internal_attributes.cloned_relation_to = ChainModel._internal_attributes.relation_to
      ChainModel.clearInternal('relation_to')
    }

    return ChainModel.callDefaultScopes()
  },

  /**
   * Returns a cloned Collection
   *
   * @class Model
   * @method clone
   *
   * @return {Collection}
   */
  clone: function(options) {
    options = options || {}
    options.clone = true
    return this.chain(options)
  }
}
