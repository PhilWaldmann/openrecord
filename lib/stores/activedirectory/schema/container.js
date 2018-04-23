/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    this.Model('Container', function() {
      this.isContainer('cn')
      this.objectClass = ['top', 'container']

      this.attribute('name', String)
      this.attribute('cn', String)
      this.attribute('description', String)
      this.attribute('objectGUID', 'guid', { persistent: false })
      this.attribute('uSNChanged', Number, { persistent: false })
      this.attribute('whenChanged', 'date', { persistent: false })
      this.attribute('whenCreated', 'date', { persistent: false })

      this.validatesPresenceOf('name')

      this.convertWrite('cn', function(cn) {
        if (!cn) cn = this.name
        return cn
      })
    })
  }
}
