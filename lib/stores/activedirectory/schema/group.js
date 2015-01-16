exports.store = {
  mixinCallback: function(){
    
    this.Model('Group', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'group']; 

      this.attribute('name', String, {emit_events: true, persistent: false});
      this.attribute('sAMAccountName', String);
      this.attribute('groupType', 'group_type');
      this.attribute('description', String);      
      
      this.attribute('objectGUID', 'guid');
      this.attribute('objectSid', 'sid');
      
      this.attribute('uSNChanged', Number);      
      this.attribute('whenChanged', 'date');
      this.attribute('whenCreated', 'date');  
      
      this.attribute('member', 'dn_array');
            
      
      this.validatesPresenceOf('name');
      
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.belongsToMany('members', {ldap: 'member', polymorph: true});
            
      
      var self = this;
      this.on('name_changed', function(record, old_value, value){
        if(value){
          record.cn = value;
          if(record.parent_dn) record.dn = self.dn(record);
        }
      });
      
      
    });
    
  }
}