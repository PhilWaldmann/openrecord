exports.store = {
  mixinCallback: function(){
    
    this.Model('Group', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'group']; 

      this.attribute('name', String);
      this.attribute('sAMAccountName', String);
      this.attribute('groupType', Number);
      this.attribute('description', String);
      
      
      this.attribute('objectGUID', 'guid');
      this.attribute('objectSid', 'sid');
      
      this.attribute('uSNChanged', Number);
      
      this.attribute('whenChanged', 'date');
      this.attribute('whenCreated', 'date');  
      
      this.attribute('member', 'dn_array');
      
      
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.belongsToMany('members', {ldap: 'members', polymorph: true});
      
    });
    
  }
}