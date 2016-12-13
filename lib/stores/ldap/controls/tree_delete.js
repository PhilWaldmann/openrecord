var ldap = require('ldapjs');
var util = require('util');

var Control = ldap.Control;



///--- API

function DeleteTreeControl(options) {
  if (!options)
    options = {};

  options.type = DeleteTreeControl.OID;
  options.value = null;

  Control.call(this, options);
  this.value = {};
}

util.inherits(DeleteTreeControl, Control);
ldap.DeleteTreeControl = DeleteTreeControl;


DeleteTreeControl.prototype.parse = function parse(buffer) {
  return true;
};


DeleteTreeControl.prototype._toBer = function (ber) {
  return;
};


DeleteTreeControl.prototype._json = function (obj) {
  obj.controlValue = this.value;
  return obj;
};



DeleteTreeControl.OID = '1.2.840.113556.1.4.805';
