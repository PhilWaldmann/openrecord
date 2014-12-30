exports.store = {
  mixinCallback: function(){
    
    this.Model('OragnizationalUnit', function(){
      this.isContainer('ou');
      this.objectClass = ['top', 'organizationalUnit'];
    
      this.attribute('name', String);
      this.attribute('description', String);
      this.attribute('objectGUID', 'guid');
      this.attribute('uSNChanged', Number);
      this.attribute('whenChanged', 'date');
      this.attribute('whenCreated', 'date');
      
      
      this.validatesPresenceOf('name');
      
      this.convertWrite('ou', function(ou){
        if(!ou) ou = this.name;
        return ou;
      });
    });
    
    this.models.ou = this.Model('OragnizationalUnit');
    
  }
}