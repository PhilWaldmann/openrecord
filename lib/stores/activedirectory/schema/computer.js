exports.store = {
  mixinCallback: function(){
    
    this.Model('Computer', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'person', 'organizationalPerson', 'user', 'computer']; 

      this.attribute('name', String);
      this.attribute('sAMAccountName', String);
      this.attribute('groupType', Number);
      this.attribute('description', String);

      this.attribute('operatingSystem', String);
      this.attribute('operatingSystemServicePack', String);
      this.attribute('operatingSystemVersion', String);
      this.attribute('servicePrincipalName', String);
      
      this.attribute('objectGUID', 'guid');
      this.attribute('objectSid', 'sid');
      
      this.attribute('uSNChanged', Number);
      
      this.attribute('whenChanged', 'date');
      this.attribute('whenCreated', 'date');  
      
      this.attribute('members', 'dn_array');
      
      
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.belongsToMany('members', {ldap: 'members', polymorph: true});
      
    });
    
  }
}