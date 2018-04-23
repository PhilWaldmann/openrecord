/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    this.Model('OrganizationalUnit', function() {
      this.isContainer('ou')
      this.objectClass = ['top', 'organizationalUnit']

      this.attribute('name', String, { emit_events: true, persistent: false })
      this.attribute('description', String)
      this.attribute('objectGUID', 'guid', { persistent: false })
      this.attribute('uSNChanged', Number, { persistent: false })
      this.attribute('whenChanged', 'date', { persistent: false })
      this.attribute('whenCreated', 'date', { persistent: false })

      this.validatesPresenceOf('name')

      var self = this
      this.on('name_changed', function(record, oldValue, value) {
        if (value) {
          record.ou = value
          if (record.parent_dn) record.dn = self.dn(record)
        }
      })

      this.hasChildren('ous', {
        model: 'OrganizationalUnit',
        conditions: { objectClass: 'organizationalUnit' }
      })
      this.hasChildren('users', {
        model: 'User',
        conditions: { objectClass: 'user' }
      })
      this.hasChildren('groups', {
        model: 'Group',
        conditions: { objectClass: 'group' }
      })
      this.hasChildren('computers', {
        model: 'Computer',
        conditions: { objectClass: 'group' }
      })
    })
  }
}
