exports.store = {
  mixinCallback: function(){
    
    this.Model('Computer', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'person', 'organizationalPerson', 'user', 'computer']; 

      this.attribute('name', String);
      this.attribute('sAMAccountName', String);
      this.attribute('description', String);

      this.attribute('operatingSystem', String);
      this.attribute('operatingSystemServicePack', String);
      this.attribute('operatingSystemVersion', String);
      this.attribute('servicePrincipalName', Array);
      this.attribute('dNSHostName', String);
      
      this.attribute('objectGUID', 'guid');
      this.attribute('objectSid', 'sid');
      
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
        
      this.attribute('userAccountControl', 'user_account_control');
      
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.belongsToMany('members', {ldap: 'members', polymorph: true});
      
      this.validatesPresenceOf('name');
      
      
      
      this.convertWrite('cn', function(cn){
        if(!cn) cn = this.name;
        return cn;
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