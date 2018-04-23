var UserAccountControlBitmask = {
  SCRIPT: 1,
  ACCOUNTDISABLED: 2,
  HOMEDIR_REQUIRED: 8,
  LOCKOUT: 16,
  PASSWD_NOTREQUIRED: 32,
  PASSWD_CANT_CHANGE: 64,
  ENCRYPTED_TEXT_PWD_ALLOWED: 128,
  TEMP_DUPLICATE_ACCOUNT: 256,
  NORMAL_ACCOUNT: 512,
  INTERDOMAIN_TRUST_ACCOUNT: 2048,
  WORKSTATION_TRUST_ACCOUNT: 4096,
  SERVER_TRUST_ACCOUNT: 8192,
  DONT_EXPIRE_PASSWORD: 65536,
  MNS_LOGON_ACCOUNT: 131072,
  SMARTCARD_REQUIRED: 262144,
  TRUSTED_FOR_DELEGATION: 524288,
  NOT_DELEGATED: 1048576,
  USE_DES_KEY_ONLY: 2097152,
  DONT_REQ_PREAUTH: 4194304,
  PASSWORD_EXPIRED: 8388608,
  TRUSTED_TO_AUTH_FOR_DELEGATION: 16777216,
  PARTIAL_SECRETS_ACCOUNT: 67108864
}

/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    this.addType(
      'user_account_control',
      {
        read: function(value) {
          if (typeof value === 'string') value = parseInt(value, 10)

          var obj = {}
          for (var attrName in UserAccountControlBitmask) {
            obj[attrName] =
              (value & UserAccountControlBitmask[attrName]) ===
              UserAccountControlBitmask[attrName]
          }

          return obj
        },

        write: function(value) {
          if (typeof value === 'number') return value
          if (!value) value = {}

          var bitmask = 0
          for (var attrName in UserAccountControlBitmask) {
            if (value[attrName] === true)
              bitmask += UserAccountControlBitmask[attrName]
          }
          return bitmask
        }
      },
      {
        binary: true,
        defaults: {
          track_object_changes: true
        },
        operators: {
          default: 'eq',
          defaults: ['eq', 'not']
        }
      }
    )
  }
}
