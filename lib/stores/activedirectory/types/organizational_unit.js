exports.definition = {
  isOragnizationalUnit: function(){
    this.rdnPrefix('ou');
    this.objectClass = 'organizationalUnit';
    
    this.attribute('name', String);
    this.attribute('objectGUID', String);
    this.attribute('uSNChanged', Number);
    this.attribute('whenChanged', 'date');
  }
}