const parseDN = require('ldapjs').parseDN

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    var self = this

    this.attribute('dn', 'dn', { emit_events: true }) // Well... it's not a realy primary key, but it's used internaly for relations...
    this.attribute('parent_dn', 'dn', { persistent: false, emit_events: true })
    this.attribute('objectClass', 'object_class', { default: self.objectClass })
    self.use(function() {
      // delay!
      this.attribute(self.rdn_prefix, String, { persistent: false })
    })

    this.on('parent_dn_changed', function(record, oldValue, value) {
      if (value) {
        record.dn = self.dn(record)
      }
    })

    this.on('dn_changed', function(record, oldValue, value) {
      if (value) {
        record.attributes.parent_dn = self.store.utils.normalizeDn(
          parseDN(value)
            .parent()
            .toString()
        ) // sets the parent_dn, but we don't want to fire a change event
      }
    })

    // add all attribute names to the search attributes
    this.beforeFind(function(options) {
      options.attributes = Object.keys(this.definition.attributes)
    }, 90)
  }
}

exports.store = {
  getAllAvailableAttributes: function(binaryOnly) {
    var tmp = []

    for (var i in this.models) {
      if (this.models[i].definition) {
        for (var name in this.models[i].definition.attributes) {
          if (this.models[i].definition.attributes.hasOwnProperty(name)) {
            if (!binaryOnly || (this.models[i].definition.attributes[name].type.binary)) {
              tmp.push(name)
            }
          }
        }
      }
    }

    return this.utils.uniq(tmp)
  }
}
