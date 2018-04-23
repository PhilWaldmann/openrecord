const ldap = require('ldapjs')
const util = require('util')

var Control = ldap.Control

/// --- API
/* istanbul ignore next */
function DeleteTreeControl(options) {
  if (!options) {
    options = {}
  }

  options.type = DeleteTreeControl.OID
  options.value = null

  Control.call(this, options)
  this.value = {}
}

util.inherits(DeleteTreeControl, Control)
module.exports = DeleteTreeControl

/* istanbul ignore next */
DeleteTreeControl.prototype.parse = function parse(buffer) {
  return true
}

/* istanbul ignore next */
DeleteTreeControl.prototype._toBer = function(ber) {}

/* istanbul ignore next */
DeleteTreeControl.prototype._json = function(obj) {
  obj.controlValue = this.value
  return obj
}

DeleteTreeControl.OID = '1.2.840.113556.1.4.805'
