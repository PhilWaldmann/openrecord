/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    this.operatorTypes = {}
    this.operatorDefault = null
  },

  // register global operators - could be overwritten per data type
  addOperator: function(name, fn, options) {
    /* istanbul ignore next */
    if (!name || typeof name !== 'string') throw new Error('No name given')

    if (typeof fn === 'object') {
      options = fn
      fn = null
    }

    options = options || {}
    name = name.toLowerCase()

    /* istanbul ignore next */
    if (this.operatorTypes[name])
      throw new Error("Operator '" + name + "' already exists")

    if (typeof fn === 'function') options.defaultMethod = fn

    if (options.on && options.on.all === undefined) options.on.all = true

    this.operatorTypes[name] = options
    if (options.default) this.operatorDefault = name
  },

  /* istanbul ignore next */
  getOperator: function(name) {
    if (typeof name === 'string') name = name.toLowerCase()
    return this.operatorTypes[name] || this.operatorTypes[this.operatorDefault]
  },

  appendOperator: function(type, operator) {
    /* istanbul ignore next */
    if (!this.attributeTypes[type])
      throw new Error("Can't find type '" + type + "'")
    /* istanbul ignore next */
    if (!this.operatorTypes[operator])
      throw new Error("Can't find operator '" + operator + "'")

    this.attributeTypes[type].operators[operator] = this.operatorTypes[operator]
  }
}
