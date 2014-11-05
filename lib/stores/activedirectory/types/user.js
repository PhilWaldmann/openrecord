exports.definition = {
  isUser: function(){
    this.rdnPrefix('cn');
    this.objectClass = 'user';
    
    this.attribute('name', String);
    this.attribute('givenName', String);
    this.attribute('sn', String);
    this.attribute('sAMAccountName', String);
    
    this.attribute('objectGUID', String);
    this.attribute('objectSid', 'sid');
    this.attribute('uSNChanged', Number);
    this.attribute('whenChanged', 'date');
    this.attribute('accountExpires', 'timestamp');
    this.attribute('memberOf', Array);
  }
}