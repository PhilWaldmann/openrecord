/* istanbul ignore next: unable to test via travis-ci */
exports.store = {
  mixinCallback: function() {
    // http://ldapwiki.willeke.com/wiki/WILL_NOT_PERFORM
    this.addLdapValidationError(
      'UnwillingToPerformError',
      '0000052D',
      'unicodePwd',
      'must meet complexity requirements'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'CANT_DISABLE_MANDATORY',
      'userAccountControl',
      'the group may not be disabled'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'NO_LOGON_SERVERS',
      'userAccountControl',
      'no logon servers available'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'NO_SUCH_PRIVILEGE',
      'userAccountControl',
      'privilege does not exist'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'INVALID_ACCOUNT_NAME',
      'userAccountControl',
      'privilege does not exist'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'USER_EXISTS',
      'sAMAccountName',
      'already exists'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'GROUP_EXISTS',
      'sAMAccountName',
      'already exists'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'MEMBER_IN_GROUP',
      'members',
      'invalid'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'LAST_ADMIN',
      'base',
      'the last admin cannot be disabled or deleted'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'ILL_FORMED_PASSWORD',
      'unicodePwd',
      'contains invalid characters'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      'PASSWORD_RESTRICTION',
      'unicodePwd',
      'must meet complexity requirements'
    ) // again?!

    // https://www.netiq.com/communities/cool-solutions/active-directory-driver-error-messages-part-5/
    // TODO: read all articles and implement accordingly. PR are welcome!
    this.addLdapValidationError(
      'OtherError',
      '00002089',
      'parent_dn',
      'not valid'
    )
    this.addLdapValidationError(
      'OtherError',
      '00000523',
      'sAMAccountName',
      'invalid characters'
    )

    this.addLdapValidationError(
      'NotAllowedOnRdnError',
      '000020B1',
      'name',
      'cannnot be modified directly'
    )
    this.addLdapValidationError(
      'NamingViolationError',
      '00000057',
      'name',
      'not valid'
    )
    this.addLdapValidationError(
      'NotAllowedOnNonLeafError',
      '0000208C',
      'base',
      'contains children'
    )
    this.addLdapValidationError(
      'EntryAlreadyExistsError',
      'ENTRY_EXISTS',
      'sAMAccountName',
      'already exists'
    )
    // https://technet.microsoft.com/en-us/library/dn535779.aspx
    this.addLdapValidationError(
      'ConstraintViolationError',
      '000021C8',
      'userPrincipalName',
      'already exists'
    )

    this.addLdapValidationError(
      'NoSuchObjectError',
      '00000525',
      'member',
      'unknown member added'
    )
    this.addLdapValidationError(
      'UnwillingToPerformError',
      '00000561',
      'member',
      'unknown member removed'
    )

    // http://ldapwiki.willeke.com/wiki/Common%20Active%20Directory%20Bind%20Errors
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 525',
      'base',
      'user not found'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 52e',
      'base',
      'invalid credentials'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 52f',
      'base',
      'not permitted due to account restrictions'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 530',
      'base',
      'not permitted to logon at this time'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 531',
      'base',
      'not permitted to logon at this workstation'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 532',
      'base',
      'password expired'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 533',
      'base',
      'account disabled'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 586',
      'base',
      'too many context ids'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 701',
      'base',
      'account expired'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 773',
      'base',
      'user must reset password'
    )
    this.addLdapValidationError(
      'InvalidCredentialsError',
      'data 775',
      'base',
      'user account locked'
    )
  }
}
