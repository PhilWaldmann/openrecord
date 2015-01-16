exports.store = {
  mixinCallback: function(){
    
    this.Model('OragnizationalUnit', function(){
      this.isContainer('ou');
      this.objectClass = ['top', 'organizationalUnit'];
    
      this.attribute('name', String, {emit_events: true, persistent: false});
      this.attribute('description', String);
      this.attribute('objectGUID', 'guid', {persistent: false});
      this.attribute('uSNChanged', Number, {persistent: false});
      this.attribute('whenChanged', 'date', {persistent: false});
      this.attribute('whenCreated', 'date', {persistent: false});
      
      
      this.validatesPresenceOf('name');
      
      var self = this;      
      this.on('name_changed', function(record, old_value, value){
        if(value){
          record.ou = value;
          if(record.parent_dn) record.dn = self.dn(record);
        }
      });
    });
    
    this.models.ou = this.Model('OragnizationalUnit');
    
  }
}