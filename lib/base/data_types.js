const validator = require('validator')

/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    this.attributeTypes = {}
    this.dynamicAttributeTypes = {}

    this.addType(String, function(value) {
      if (value === null) return null
      if (value === undefined) return null
      return value.toString()
    })

    this.addType(Number, function(value) {
      if (value === null) return null
      return validator.toFloat(value + '')
    })

    this.addType(Date, function(value) {
      if (value === null) return null
      return validator.toDate(value + '')
    })

    this.addType(Boolean, function(value) {
      if (value === null) return null
      return validator.toBoolean(value + '')
    })

    this.addType(
      Array,
      function(value) {
        if (value === null) return null
        if (!Array.isArray(value)) return [value]
        return value
      },
      {
        array: true
      }
    )

    this.addType(Object, function(value) {
      if (value === null) return null
      return value
    })

    this.addType(Buffer, {
      input: function(value) {
        if (value === null) return null
        if (value instanceof String) {
          if (Buffer.from) return Buffer.from(value, 'hex')
          return new Buffer(value, 'hex') // eslint-disable-line node/no-deprecated-api
        }

        if (Buffer.from) return Buffer.from(value, 'binary')
        return new Buffer(value, 'binary') // eslint-disable-line node/no-deprecated-api
      },
      output: function(value) {
        if (value === null) return null
        return value.toString('hex')
      }
    })
  },

  addType: function(name, cast, options) {
    options = options || {}

    if (typeof cast === 'object') {
      if (!cast.input) cast.input = noCastFn
      if (!cast.output) cast.output = noCastFn
    }

    if (typeof name === 'string') name = name.toLowerCase()
    if (typeof cast === 'function')
      cast = { input: cast, output: cast, read: cast, write: cast }

    if (typeof name === 'string') {
      if (!options || !options.extend) {
        if (!cast.read)
          throw new Error('No read cast() method given for type "' + name + '"')
        if (!cast.write)
          throw new Error(
            'No write cast() method given for type "' + name + '"'
          )
      }
    }

    if (options && options.operators) {
      var ops = options.operators
      var opName

      // loop over all custom operators
      for (opName in ops) {
        if (
          ops.hasOwnProperty(opName) &&
          opName !== 'defaults' &&
          opName !== 'default'
        ) {
          if (typeof ops[opName] === 'function') {
            ops[opName] = { name: opName, method: ops[opName] } // this is the default operator format.
          } else {
            if (!ops[opName].name) ops[opName].name = opName
          }
        }
      }

      // set the default operator for that type
      ops.default = ops.default || this.operatorDefault

      // set default operators (defined via store.addOperator)
      if (Array.isArray(ops.defaults)) {
        for (var i = 0; i < ops.defaults.length; i++) {
          opName = ops.defaults[i]
          if (this.operatorTypes[opName] && !ops[opName]) {
            ops[opName] = this.operatorTypes[opName]
          }
        }
        delete ops.defaults
      }
    }

    if (!name) throw new Error('No name given')
    if (!cast) throw new Error('No valid cast() method given')

    if (typeof name === 'string') name = name.toLowerCase()
    if (typeof cast === 'function') cast = { input: cast, output: cast }

    if (options.extend) {
      if (typeof options.extend === 'string')
        options.extend = options.extend.toLowerCase()

      if (this.attributeTypes[options.extend]) {
        var extend = this.attributeTypes[options.extend].cast

        for (var n in extend) {
          if (extend.hasOwnProperty(n) && !cast[n]) {
            cast[n] = extend[n]
          }
        }
      }
    }

    if (!cast.input) throw new Error('No intput cast() method given')
    if (!cast.output) throw new Error('No output cast() method given')

    options.name = name
    options.cast = cast

    this.attributeTypes[name] = options
  },

  getType: function(name) {
    if (typeof name === 'string') name = name.toLowerCase()
    return this.attributeTypes[name]
  }
}

var noCastFn = function(value) {
  return value
}
