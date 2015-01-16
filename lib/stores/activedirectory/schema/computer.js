exports.store = {
  mixinCallback: function(){
    
    this.Model('Computer', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'person', 'organizationalPerson', 'user', 'computer']; 

      this.attribute('name', String, {emit_events: true, persistent: false});
      this.attribute('sAMAccountName', String);
      this.attribute('description', String);

      this.attribute('operatingSystem', String);
      this.attribute('operatingSystemServicePack', String);
      this.attribute('operatingSystemVersion', String);
      this.attribute('servicePrincipalName', Array);
      this.attribute('dNSHostName', String);
      
      this.attribute('objectGUID', 'guid');
      this.attribute('objectSid', 'sid');
      //this.attribute('primaryGroupID', Number, {default: 515});
      
      this.attribute('uSNChanged', Number);
      
      this.attribute('whenChanged', 'date');
      this.attribute('whenCreated', 'date');  
      this.attribute('accountExpires', 'timestamp');
      this.attribute('pwdLastSet', 'timestamp');
      this.attribute('badPasswordTime', 'timestamp');
      this.attribute('lastLogon', 'timestamp');
      this.attribute('lastLogoff', 'timestamp');
      
      this.attribute('badPwdCount', Number);
      this.attribute('logonCount', Number);
        
      this.attribute('userAccountControl', 'user_account_control', {default:{PASSWD_NOTREQUIRED: true, WORKSTATION_TRUST_ACCOUNT: true}});
      
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.belongsToMany('members', {ldap: 'members', polymorph: true});
      
      this.validatesPresenceOf('name');
      
      
      var self = this;
      this.on('name_changed', function(record, old_value, value){
        if(value){
          record.cn = value;
        }
        if(record.parent_dn) record.dn = self.dn(record);
        if(!record.sAMAccountName) record.sAMAccountName = value;
      });
    
    
      
    
      this.convertWrite('sAMAccountName', function(account_name){
        if(!account_name) account_name = this.name;
        if(!account_name.match(/^\$/)) account_name = '$' + account_name;
        return account_name;
      });
    
    
      this.convertWrite('userAccountControl', function(control){
        control = control || {};

        control.PASSWD_NOTREQUIRED = true;
        control.WORKSTATION_TRUST_ACCOUNT = true;
      
        return control;
      });
      
    });
    
  }
}