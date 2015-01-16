var ldap  = require('ldapjs');

exports.store = {
  
  mixinCallback: function(){
    this.ldap_errors = [];
  },
  
  addLdapValidationError: function(error_type, msg_match, attribute, error){
    if(ldap[error_type]){
      this.ldap_errors.push({
        cls: ldap[error_type],
        match: msg_match,
        attribute: attribute,
        error: error
      })
    }    
  },
  
  convertLdapErrorToValidationError: function(record, error){
    for(var i = 0; i < this.ldap_errors.length; i++){
      //check error class
      if(error instanceof this.ldap_errors[i].cls){
        //check message match
        if(error.message.match(this.ldap_errors[i].match)){
          //add validation error + return null to avoid promise rejection
          record.errors.add(this.ldap_errors[i].attribute, this.ldap_errors[i].error);
          return null;
        }        
      }
    }
    
    return error;
  }
};
