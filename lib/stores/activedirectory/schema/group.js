exports.store = {
  mixinCallback: function(){

    this.Model('Group', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'group'];

      this.attribute('name', String, {emit_events: true, persistent: false});
      this.attribute('sAMAccountName', String);
      this.attribute('groupType', 'group_type');
      this.attribute('description', String);

      this.attribute('objectGUID', 'guid', {persistent: false});
      this.attribute('objectSid', 'sid', {persistent: false});

      this.attribute('uSNChanged', Number, {persistent: false});
      this.attribute('whenChanged', 'date', {persistent: false});
      this.attribute('whenCreated', 'date', {persistent: false});

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
