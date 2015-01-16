exports.store = {
  
  mixinCallback: function(){
    //http://ldapwiki.willeke.com/wiki/WILL_NOT_PERFORM
    this.addLdapValidationError('UnwillingToPerformError', '0000052D', 'unicodePwd', 'must meet complexity requirements');
    this.addLdapValidationError('UnwillingToPerformError', 'CANT_DISABLE_MANDATORY', 'userAccountControl', 'the group may not be disabled');
    this.addLdapValidationError('UnwillingToPerformError', 'NO_LOGON_SERVERS', 'userAccountControl', 'no logon servers available');
    this.addLdapValidationError('UnwillingToPerformError', 'NO_SUCH_PRIVILEGE', 'userAccountControl', 'privilege	does not exist');
    this.addLdapValidationError('UnwillingToPerformError', 'INVALID_ACCOUNT_NAME', 'userAccountControl', 'privilege	does not exist');    
    this.addLdapValidationError('UnwillingToPerformError', 'USER_EXISTS', 'sAMAccountName', 'already exists');
    this.addLdapValidationError('UnwillingToPerformError', 'GROUP_EXISTS', 'sAMAccountName', 'already exists');
    this.addLdapValidationError('UnwillingToPerformError', 'MEMBER_IN_GROUP', 'members', 'invalid');
    this.addLdapValidationError('UnwillingToPerformError', 'LAST_ADMIN', 'base', 'the last admin cannot be disabled or deleted');
    this.addLdapValidationError('UnwillingToPerformError', 'ILL_FORMED_PASSWORD', 'unicodePwd', 'contains invalid characters');
    this.addLdapValidationError('UnwillingToPerformError', 'PASSWORD_RESTRICTION', 'unicodePwd', 'must meet complexity requirements'); //again?!
    
    this.addLdapValidationError('OtherError', '00002089', 'parent_dn', 'not valid');    
    this.addLdapValidationError('NotAllowedOnRdnError', '000020B1', 'name', 'cannnot be modified directly');
    this.addLdapValidationError('NamingViolationError', '00000057', 'name', 'not valid');
    
    
  }
  
};
