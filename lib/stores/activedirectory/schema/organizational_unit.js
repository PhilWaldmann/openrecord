exports.definition = {
  isOragnizationalUnit: function(){
    this.isContainer('ou');
    this.objectClass = ['top', 'organizationalUnit'];
    
    this.attribute('name', String);
    this.attribute('objectGUID', String);
    this.attribute('uSNChanged', Number);
    this.attribute('whenChanged', 'date');
    
  }
}