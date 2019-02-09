const validator = require('validator')

/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    this.addInterceptor('beforeValidation')
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.validations = {}
  },

  /**
   * Validate any field with a custom function.
   * Synchronous: just return `true` or `false`
   * Asynchronous: put a `done` parameter into your callback and call `done()` when finished.
   *
   * @class Definition
   * @method validates
   * @param {array} fields - The fields to validate
   * @param {function} callback - The validation callback
   *
   * @callback
   * @param {function} done - Optional: If you need a async validation, just call `done()` when finished
   * @this Record
   *
   * @return {Definition}
   */
  validates: function(fields, fn) {
    if (typeof fields === 'function') {
      fn = fields
      fields = '__base'
    }
    if (!fn) throw new this.definition.store.NoCallbackError()
    if (!Array.isArray(fields)) fields = [fields]

    for (var i in fields) {
      var attr = this.store.toInternalAttributeName(fields[i])
      this.validations[attr] = this.validations[attr] || []
      this.validations[attr].push(fn)
    }

    return this
  },

  /**
   * This validator checks the given field`s value is not null.
   * @class Definition
   * @method validatesPresenceOf
   * @param {array} fields - The fields to validate
   *
   * @return {Definition}
   */
  validatesPresenceOf: function() {
    var args = this.store.utils.args(arguments)
    if (args.length > 1) {
      return this.validateFieldsHelper(args, this.validatesPresenceOf)
    }

    var field = args[0]

    if (Array.isArray(field)) {
      return this.validateFieldsHelper(field, [], this.validatesPresenceOf)
    }

    return this.validates(field, function() {
      var valid = this[field] != null
      if (!valid) this.errors.add(field, 'should be present')
      return valid
    })
  },

  /**
   * This validator checks if the given field`s value and <field_name>_confirmation are the same.
   * @class Definition
   * @method validatesConfirmationOf
   * @param {array} fields - The fields to validate
   *
   * @return {Definition}
   */
  validatesConfirmationOf: function() {
    var args = this.store.utils.args(arguments)
    if (args.length > 1) {
      return this.validateFieldsHelper(args, this.validatesConfirmationOf)
    }

    var field = args[0]
    var confirmationField = field + '_confirmation'

    return this.validates(field, function() {
      var valid = this[field] === this[confirmationField]
      if (!valid) this.errors.add(field, 'confirmation error')
      return valid
    })
  },

  /**
   * This validator checks the format of a field.
   * Valid format types are:
   * * `email`
   * * `url`
   * * `ip`
   * * `uuid`
   * * `date`
   * * null
   * * Regular expression
   *
   * @memberof Definition
   * @method validatesFormatOf
   * @param {array} fields - The fields to validate
   * @param {(string|RegExp|null)} format - The format type
   * @param {object} options - The options hash
   * @param {boolean} options.allow_null - Skip validation if value is null
   *
   * @return {Definition}
   */
  validatesFormatOf: function(field, format, options) {
    options = options || {}

    if (Array.isArray(field)) {
      return this.validateFieldsHelper(field, [format], this.validatesFormatOf)
    }

    return this.validates(field, function() {
      var valid = false
      var value = this[field]

      switch (format) {
        case 'email':
          valid = validator.isEmail(value + '')
          break

        case 'url':
          valid = validator.isURL(value + '')
          break

        case 'ip':
          valid = validator.isIP(value + '')
          break

        case 'uuid':
          valid = validator.isUUID(value + '')
          break

        case 'date':
          valid = value instanceof Date
          break

        case null:
          valid = value === null || validator.isEmpty(value + '')
          break
        default:
          valid = validator.matches(value + '', format)
          break
      }

      if (value === null && options.allow_null) return true

      if (!valid) this.errors.add(field, 'not a valid format')
      return valid
    })
  },

  /**
   * This validator checks if the given field`s values length is lesss than or equal `length`.
   * @class Definition
   * @method validatesLengthOf
   * @param {string} field - The field to validate
   * @param {integer} length - The maximum length
   *
   * @return {Definition}
   */
  validatesLengthOf: function(field, length) {
    if (Array.isArray(field)) {
      return this.validateFieldsHelper(field, [length], this.validatesLengthOf)
    }

    return this.validates(field, function() {
      var valid = true
      if (this[field]) valid = this[field].length <= length
      if (!valid)
        this.errors.add(field, 'maximum length of ' + length + ' exceeded')
      return valid
    })
  },

  /**
   * This validator checks if the given field`s values is an allowed value
   * @class Definition
   * @method validatesInclusionOf
   * @param {string} field - The field to validate
   * @param {array} allowedValues - The array of allowed values
   *
   * @return {Definition}
   */
  validatesInclusionOf: function(field, allowedValues) {
    if (Array.isArray(field)) {
      return this.validateFieldsHelper(
        field,
        [allowedValues],
        this.validatesInclusionOf
      )
    }

    return this.validates(field, function() {
      var valid = true
      if (this[field]) valid = allowedValues.indexOf(this[field]) !== -1
      if (!valid)
        this.errors.add(
          field,
          'only allow one of [' + allowedValues.join(', ') + ']'
        )
      return valid
    })
  },

  /**
   * This validator checks if the given field`s values length.
   * @class Definition
   * @method validatesNumericalityOf
   * @param {string} field - The field to validate
   * @param {object} options - The options hash
   *
   * @options
   * @param {boolean} allow_null - Skip validation if value is null
   * @param {integer} eq - value need to be equal `eq`
   * @param {integer} gt - value need to be greater than `gt`
   * @param {integer} gte - value need to be greater than or equal `gte`
   * @param {integer} lt - value need to be lower than `lt`
   * @param {integer} lte - value need to be lower than or equal `lte`
   * @param {boolean} even - value need to be even
   * @param {boolean} off - value need to be odd
   *
   * @return {Definition}
   */
  validatesNumericalityOf: function(field, options) {
    if (Array.isArray(field)) {
      return this.validateFieldsHelper(
        field,
        [options],
        this.validatesNumericalityOf
      )
    }

    return this.validates(field, function() {
      var valid = true
      var value = this[field]

      if (options.eq !== undefined && options.eq !== value) valid = false
      if (options.gt !== undefined && options.gt >= value) valid = false
      if (options.gte !== undefined && options.gte > value) valid = false
      if (options.lt !== undefined && options.lt <= value) valid = false
      if (options.lte !== undefined && options.lte < value) valid = false
      if (options.even !== undefined && value % 2 === 1) valid = false
      if (options.odd !== undefined && value % 2 === 0) valid = false

      if (options.allow_null === true && value === null) valid = true

      if (!valid) this.errors.add(field, 'not a valid number')
      return valid
    })
  },

  validateFieldsHelper: function(fields, args, fn) {
    if (typeof args === 'function') {
      fn = args
      args = []
    }

    for (var i in fields) {
      fn.apply(this, [fields[i]].concat(args))
    }
    return this
  }
}

/*
 * RECORD
 */
exports.record = {
  /**
   * validates the record
   *
   * @class Record
   * @method validate
   *
   * @this Promise
   */
  validate: function() {
    var self = this
    var validations = []

    return self
      .callInterceptors('beforeValidation', [self])
      .then(function() {
        for (var field in self.definition.validations) {
          var fieldValidations = self.definition.validations[field]

          // set the scope of all validator function to the current record
          for (var i in fieldValidations) {
            validations.push(fieldValidations[i].bind(self))
          }
        }
        return self.store.utils.parallel(validations)
      })
      .then(function(result) {
        if (self.errors.has) throw self.errors
      })
      .then(function() {
        return self.callInterceptors('afterValidation', [self])
      })
      .then(function() {
        return self
      })
  },

  /**
   * validates the record and returns true or false
   *
   * @class Record
   * @method validate
   *
   * @this Promise
   */
  isValid: function(resolve) {
    var self = this
    return this.validate()
      .then(function() {
        return true
      })
      .catch(function(error) {
        if (error instanceof self.store.ValidationError) return false
        throw error
      })
      .then(resolve)
  }
}
