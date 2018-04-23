const ldap = require('ldapjs')

/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    var store = this

    this.Model('User', function() {
      this.rdnPrefix('cn')
      this.objectClass = ['top', 'person', 'organizationalPerson', 'user']

      this.attribute('name', String, { emit_events: true, persistent: false })
      this.attribute('givenName', String)
      this.attribute('cn', String)
      this.attribute('sn', String)
      this.attribute('displayName', String)
      this.attribute('sAMAccountName', String)
      this.attribute('userPrincipalName', String)
      this.attribute('mail', String)
      this.attribute('description', String)

      this.attribute('unicodePwd', String, { emit_events: true }) // 'password');

      this.attribute('objectGUID', 'guid', { persistent: false })
      this.attribute('objectSid', 'sid', { persistent: false })

      this.attribute('uSNChanged', Number, { persistent: false })

      this.attribute('whenChanged', 'date', { persistent: false })
      this.attribute('whenCreated', 'date', { persistent: false })
      this.attribute('accountExpires', 'timestamp')
      this.attribute('pwdLastSet', 'timestamp')
      this.attribute('badPasswordTime', 'timestamp', { persistent: false })
      this.attribute('lastLogon', 'timestamp', { persistent: false })
      this.attribute('lastLogoff', 'timestamp', { persistent: false })

      this.attribute('badPwdCount', Number, { persistent: false })
      this.attribute('logonCount', Number, { persistent: false })

      this.attribute('homeDirectory', String)
      this.attribute('homeDrive', String)

      this.attribute('memberOf', 'dn_array')

      this.attribute('userAccountControl', 'user_account_control', {
        default: { ACCOUNTDISABLED: true, NORMAL_ACCOUNT: true }
      })

      this.validatesPresenceOf('name')
      this.validatesLengthOf('sAMAccountName', 20)

      this.hasParent('ou', { model: 'OrganizationalUnit' })
      this.hasMany('groups', { from: 'dn', to: 'member', autoSave: true })

      var self = this
      this.on('name_changed', function(record, oldValue, value) {
        if (value) {
          record.cn = value
          if (record.parent_dn) record.dn = self.dn(record)
          if (!record.sAMAccountName) record.sAMAccountName = value
          if (!record.userPrincipalName) record.userPrincipalName = value
          if (!record.displayName) record.displayName = value
        }
      })

      // if the password is present, enable the user
      this.on('unicodePwd_changed', function(record, oldValue, value) {
        if (value) {
          record.userAccountControl = record.userAccountControl || {}
          record.userAccountControl.ACCOUNTDISABLED = false
        }
      })

      this.checkPassword = function(password, callback) {
        var user = this

        // we need to create a new connection... and use bind() to check the password
        var client = ldap.createClient({
          url: store.config.url,
          tlsOptions: store.config.tlsOptions
        })

        return new Promise(function(resolve, reject) {
          client.bind(user.dn, password, function(err) {
            if (err) {
              reject(store.convertLdapErrorToValidationError(user, err))
            } else {
              resolve(user)
            }

            client.unbind()
          })
        }).then(callback)
      }

      this.convertWrite('cn', function(cn) {
        if (!cn) cn = this.sAMAccountName
        return cn
      })

      this.convertWrite('unicodePwd', function(password) {
        // convert password to AD format:
        var convertedPassword = ''
        password = '"' + password + '"'

        for (var i = 0; i < password.length; i++) {
          convertedPassword += String.fromCharCode(
            password.charCodeAt(i) & 0xff,
            (password.charCodeAt(i) >>> 8) & 0xff
          )
        }

        return convertedPassword
      })

      this.beforeFind(function() {
        if (this.getInternal('without_object_class') !== true) {
          this.where({ objectClass_not: 'computer' })
        }
      })
    })
  }
}
