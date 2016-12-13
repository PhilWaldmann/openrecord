exports.store = {
  mixinCallback: function(){

    this.Model('Computer', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'person', 'organizationalPerson', 'user', 'computer'];

      this.attribute('name', String, {emit_events: true, persistent: false});
      this.attribute('sAMAccountName', String);
      this.attribute('description', String);

      this.attribute('operatingSystem', String, {persistent: false});
      this.attribute('operatingSystemServicePack', String, {persistent: false});
      this.attribute('operatingSystemVersion', String, {persistent: false});
      this.attribute('servicePrincipalName', Array, {persistent: false});
      this.attribute('dNSHostName', String, {persistent: false});

      this.attribute('objectGUID', 'guid', {persistent: false});
      this.attribute('objectSid', 'sid', {persistent: false});
      //this.attribute('primaryGroupID', Number, {default: 515});

      this.attribute('uSNChanged', Number, {persistent: false});

      this.attribute('whenChanged', 'date', {persistent: false});
      this.attribute('whenCreated', 'date', {persistent: false});
      this.attribute('accountExpires', 'timestamp');
      this.attribute('pwdLastSet', 'timestamp');
      this.attribute('badPasswordTime', 'timestamp', {persistent: false});
      this.attribute('lastLogon', 'timestamp', {persistent: false});
      this.attribute('lastLogoff', 'timestamp', {persistent: false});

      this.attribute('badPwdCount', Number, {persistent: false});
      this.attribute('logonCount', Number, {persistent: false});

      this.attribute('userAccountControl', 'user_account_control', {default:{PASSWD_NOTREQUIRED: true, WORKSTATION_TRUST_ACCOUNT: true}});

      this.attribute('memberOf', 'dn_array');

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
        if(!account_name.match(/\$$/)) account_name = account_name + '$';
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
