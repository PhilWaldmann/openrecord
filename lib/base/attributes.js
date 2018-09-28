exports.store = {
  mixinCallback: function() {
    const Store = require('../store')

    Store.addExceptionType(function UnknownAttributeError(name) {
      Error.apply(this)
      this.message = 'Unknown attribute "' + name + '"'
    })

    Store.addExceptionType(function UnknownAttributeTypeError(type) {
      Error.apply(this)
      this.message = 'Unknown attribute type "' + type + '"'
    })
  },

  toInternalAttributeName: function(name){
    if(typeof this.config.internalAttributeName === 'function'){
      return this.config.internalAttributeName(name)
    }
    return name
  },

  toExternalAttributeName: function(name){
    if(typeof this.config.externalAttributeName === 'function'){
      return this.config.externalAttributeName(name)
    }
    return name
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.attributes = {}
    this.definedGetter = {}
  },

  /**
   * Add a new attribute to your Model
   *
   * @public
   * @memberof Definition
   * @method attribute
   * @param {string} name - The attribute name
   * @param {string} type - The attribute type (e.g. `text`, `integer`, or sql language specific. e.g. `blob`)
   * @param {object} [options] - Optional options
   * @param {boolean} [options.writable=true] - make it writeable
   * @param {boolean} [options.readable=true] - make it readable
   * @param {any} [options.default=null] - Default value
   * @param {boolean} [options.emit_events=false] - emit change events `name_changed`
   *
   * @return {Definition}
   */
  attribute: function(name, type, options) {
    const Store = require('../store')
    options = options || {}
    type = type || String

    if (typeof type === 'string') {
      type = type.toLowerCase()
    }

    var fieldType = this.store.getType(type)
    if (!fieldType) {
      throw new Store.UnknownAttributeTypeError(type)
    }

    Object.assign(options, fieldType.defaults)

    options.name = this.store.toExternalAttributeName(name)
    options.type = fieldType
    options.writable =
      options.writable === undefined ? true : !!options.writable
    options.readable =
      options.readable === undefined ? true : !!options.readable
    options.track_object_changes =
      options.track_object_changes === undefined
        ? false
        : !!options.track_object_changes
    options.notifications = []

    this.attributes[name] = options

    this.setter(
      name,
      options.setter ||
        function(value) {
          this.set(options.name, value)
        }
    )

    if (options.readable || options.getter) {
      this.getter(
        name,
        options.getter ||
          function() {
            return this.get(name)
          },
        true
      )
    }

    return this
  },

  cast: function(attribute, value, castName, record) {
    attribute = this.store.toInternalAttributeName(attribute)
    castName = castName || 'input'
    var attr = this.attributes[attribute]
    var cast = attr ? attr.type.cast[castName] : null
    var output = value

    if (attr && cast) {
      if (Array.isArray(value) && !attr.type.array) {
        output = []
        for (var i = 0; i < value.length; i++) {
          output[i] = this.cast(attribute, value[i], castName, record)
        }
      } else {
        if (record) output = cast.call(record, value, attribute)
        else output = cast(value, attribute)
      }
    }

    return output
  },

  /**
   * getter function
   *
   * @public
   * @callback getterFN
   * @return *
   * @this Model
   */

  /**
   * Add a custom getter to your record
   *
   * @public
   * @memberof Definition
   * @method getter
   * @param {string} name - The getter name
   * @param {getterFN} fn - The method to call
   *
   * @return {Definition}
   */
  getter: function(name, fn, internal) {
    const externalName = this.store.toExternalAttributeName(name)
    this.instanceMethods.__defineGetter__(name, fn)
    if(externalName !== name) this.instanceMethods.__defineGetter__(externalName, fn)
    if (!internal) this.definedGetter[name] = fn

    return this
  },

  /**
   * Add a custom setter to your record
   *
   * @class Definition
   * @method setter
   * @param {string} name - The setter name
   * @param {function} fn - The method to call
   *
   * @return {Definition}
   */
  setter: function(name, fn) {
    const externalName = this.store.toExternalAttributeName(name)
    this.instanceMethods.__defineSetter__(name, fn)
    if(externalName !== name) this.instanceMethods.__defineSetter__(externalName, fn)
    return this
  },

  /**
   * Add a variant method to the specified attribute
   *
   * @class Definition
   * @method variant
   * @param {string} name - The attribute name
   * @param {function} fn - The method to call
   *
   * @return {Definition}
   */
  variant: function(name, fn) {
    const _name = this.store.toInternalAttributeName(name)
    const Store = require('../store')
    if (!this.attributes[_name]) throw new Store.UnknownAttributeError(name)

    this.attributes[_name].variant = fn

    this[name + '$'] = function(args) {
      return fn.call(this, this[_name], args)
    }

    return this
  }
}

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config, castType) {
    this.relations = {}
    this.attributes = {}
    this.changes = {} // e.g. {login: ['phil', 'philipp']} first value is the original, second is the changed value
    this.object_changes = {}

    if (config) {
      this.set(config, castType)
    }
  },

  /**
   * Set one or multiple attributes of a Record.
   *
   * @class Record
   * @method set
   * @param {string} name - The attributes name
   * @param {VALUE} value - The attributes value
   * @or
   * @param {object} attributes - Multiple attribute as an object
   * @param {string} cast_type - Optional cast_type name (Default: `input`)
   *
   * @return {Record}
   */
  set: function(name, value) {
    if (!name && !value) return

    var values = name
    var castType = value
    var singleAssign = false
    if (typeof name === 'string') {
      values = {}
      values[name] = value
      castType = 'input'
      singleAssign = true
    }

    for (var field in this.definition.attributes) {
      if (this.definition.attributes.hasOwnProperty(field)) {
        var definition = this.definition.attributes[field]
        var fieldName = castType === 'input' ? definition.name : field

        if (singleAssign && values[fieldName] === undefined) {
          continue
        }

        value = values[fieldName]

        if (!singleAssign && value && typeof definition.setter === 'function') {
          definition.setter.call(this, value)
          continue
        }

        if (
          value === undefined &&
          this.attributes[field] === undefined &&
          definition.default !== undefined
        ) {
          if (typeof definition.default === 'function')
            value = definition.default()
          else value = this.definition.store.utils.clone(definition.default)
        }

        if (value === undefined && this.attributes[field] !== undefined) {
          value = this.attributes[field]
        }

        if (value === undefined) {
          value = null
        }

        // typecasted value
        castType = castType || 'input'

        if (!definition.type.cast[castType]) {
          castType = 'input'
        }

        value =
          value !== null
            ? this.definition.cast(field, value, castType, this)
            : null

        if (this.attributes[field] !== value) {
          if (value && typeof value === 'object') {
            // automatically set object tracking to true if the value is still an object after the casting
            definition.track_object_changes = true
          }

          if (
            definition.writable &&
            !(value === null && this.attributes[field] === undefined)
          ) {
            var beforeValue = this[field]
            var afterValue = value

            if (this.changes[field]) {
              this.changes[field][1] = afterValue
            } else {
              this.changes[field] = [beforeValue, afterValue]
            }
          }

          if (
            definition.track_object_changes &&
            (this.object_changes[field] === undefined || castType !== 'input')
          ) {
            // initial object hash
            this.object_changes[field] = [
              this.definition.store.utils.getHash(value),
              JSON.stringify(value)
            ]
          }

          if (definition.notifications) {
            definition.notifications.forEach(function(fn) {
              fn.call(this, value, castType)
            }, this)
          }

          this.attributes[field] = value

          // TODO: remove in 2.1!
          if (definition.emit_events && beforeValue !== value) {
            // emit old_value, new_value
            this.definition.emit(field + '_changed', this, beforeValue, value)
          }
        }
      }
    }

    return this
  },

  /**
   * Get an attributes.
   *
   * @class Record
   * @method get
   * @param {string} name - The attributes name
   *
   * @return {VALUE}
   */
  get: function(name) {
    var attr = this.definition.attributes[name]

    if (attr) {
      // set undefined values to null
      if (this.attributes[name] === undefined) {
        this.attributes[name] = null
      }

      return this.definition.cast(name, this.attributes[name], 'output', this)
    }

    return null
  },

  /**
   * Returns `true` if there are any changed values in that record
   *
   * @class Record
   * @method hasChanges
   *
   * @return {boolean}
   */
  hasChanges: function() {
    this.checkObjectChanges()
    return Object.keys(this.getChanges()).length > 0
  },

  /**
   * Returns `true` if the given attributes has changed
   *
   * @class Record
   * @method hasChanged
   * @param {string} name - The attributes name
   *
   * @return {boolean}
   */
  hasChanged: function(name) {
    return Object.keys(this.getChanges()).indexOf(name) !== -1
  },

  /**
   * Returns an object with all the changes. One attribute will always include the original and current value
   *
   * @class Record
   * @method getChanges
   *
   * @return {object}
   */
  getChanges: function() {
    this.checkObjectChanges()
    var tmp = {}
    for (var name in this.changes) {
      if (this.changes.hasOwnProperty(name)) {
        if (
          !this.allowed_attributes ||
          (this.allowed_attributes &&
            this.allowed_attributes.indexOf(name) !== -1)
        ) {
          tmp[name] = this.changes[name]
        }
      }
    }
    return tmp
  },

  /**
   * Returns an object with all changed values
   *
   * @class Record
   * @method getChangedValues
   *
   * @return {object}
   */
  getChangedValues: function() {
    this.checkObjectChanges()
    var tmp = {}
    for (var name in this.changes) {
      if (this.changes.hasOwnProperty(name)) {
        if (
          !this.allowed_attributes ||
          (this.allowed_attributes &&
            this.allowed_attributes.indexOf(name) !== -1)
        ) {
          tmp[name] = this.changes[name][1]
        }
      }
    }
    return tmp
  },

  /**
   * Resets all changes to the original values
   *
   * @class Record
   * @method resetChanges
   *
   * @return {Record}
   */
  resetChanges: function() {
    for (var name in this.changes) {
      if (this.changes.hasOwnProperty(name)) {
        this.attributes[name] = this.changes[name][0]
      }
    }

    this.changes = {}
    return this
  },

  checkObjectChanges: function() {
    for (var field in this.object_changes) {
      if (this.object_changes.hasOwnProperty(field)) {
        if (this.attributes[field]) {
          var hash = this.definition.store.utils.getHash(this.attributes[field])
          if (hash !== this.object_changes[field][0] && !this.changes[field]) {
            this.changes[field] = [
              JSON.parse(this.object_changes[field][1]),
              this.attributes[field]
            ]
          }
        }
      }
    }
  }
}
