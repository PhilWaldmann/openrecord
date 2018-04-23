var util = require('util')

exports.store = {
  mixinCallback: function() {
    const Store = require('../store')

    Store.addExceptionType(function ReservedAttributeError(attr) {
      Error.apply(this)
      this.message = 'Attribute "' + attr + '" is reserved'
    })

    Store.addExceptionType(ValidationError, true)
  }
}

/**
 * The error object on the Record is a Object with a `add` method
 * You could add validation errors to that object via
 * ```js
 *  this.errors.add('my_field', 'Some error');
 * ```
 *
 * which will result in the following error object
 * ```
 * {my_field: ['Some error']}
 * ```
 *
 * @class Record
 * @name The Error Object
 */

function ValidationError(record) {
  Object.defineProperty(this, 'has', {
    enumerable: false,
    writable: true,
    value: false
  })
  Object.defineProperty(this, 'record', {
    enumerable: false,
    writable: true,
    value: record
  })
  Object.defineProperty(this, 'errors', {
    enumerable: true,
    writable: true,
    value: {}
  })
}

util.inherits(ValidationError, Error)
ValidationError.prototype.name = 'ValidationError'

ValidationError.prototype.add = function(name, message) {
  if (!message) {
    message = name
    name = 'base'
  }
  this.errors[name] = this.errors[name] || []
  this.errors[name].push(message)
  this.has = true
}

ValidationError.prototype.set = function(object) {
  for (var name in object) {
    if (object.hasOwnProperty(name)) {
      this.errors[name] = this.errors[name] || []
      this.errors[name].push(object[name])
      this.has = true
    }
  }
}

ValidationError.prototype.each = function(callback) {
  for (var name in this.errors) {
    if (this.errors.hasOwnProperty(name) && Array.isArray(this.errors[name])) {
      for (var i = 0; i < this.errors[name].length; i++) {
        if (typeof callback === 'function') callback(name, this.errors[name][i])
      }
    }
  }
}

ValidationError.prototype.toJSON = function() {
  if (Object.keys(this.errors).length === 0) return
  return this.errors
}

ValidationError.prototype.toString = function() {
  var tmp = []
  var hasErrors = false
  var self = this

  Object.keys(self.errors).forEach(function(name) {
    var error = self.errors[name]

    if (error instanceof Array && typeof error[0] === 'string')
      error = error.join(', ')
    else error = JSON.stringify(error) // TODO: make it prettier!? V3.0

    tmp.push((name === 'base' ? '' : name + ': ') + error)
    hasErrors = true
  })

  if (hasErrors) return tmp.join('\n')
  return ''
}

ValidationError.prototype.inspect = function() {
  return (
    'ValidationError: \n  ' +
    this.toString().replace(/\n/g, '\n  ') +
    '\n\n    at ' +
    this.record.inspect()
  )
}

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function() {
    this.errors = this.errors || new ValidationError(this)
  }
}
