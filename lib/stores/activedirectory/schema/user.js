var ldap = require('ldapjs');


exports.store = {
  mixinCallback: function(){
    
    var store = this;
    
    this.Model('User', function(){
      this.rdnPrefix('cn');
      this.objectClass = ['top', 'person', 'organizationalPerson', 'user']; 
    
      this.attribute('givenName', String);
      this.attribute('sn', String);
      this.attribute('sAMAccountName', String);
      this.attribute('userPrincipalName', String);
      this.attribute('mail', String);
      this.attribute('description', String);
      
      this.attribute('unicodePwd', String); //'password');
      
      this.attribute('objectGUID', 'guid');
      this.attribute('objectSid', 'sid');
      
      this.attribute('uSNChanged', Number);
      
      this.attribute('whenChanged', 'date');
      this.attribute('whenCreated', 'date');
      this.attribute('accountExpires', 'timestamp');
      this.attribute('pwdLastSet', 'timestamp');
      this.attribute('badPasswordTime', 'timestamp');
      this.attribute('lastLogon', 'timestamp');
      this.attribute('lastLogoff', 'timestamp');
      
      this.attribute('badPwdCount', Number);
      this.attribute('logonCount', Number);
      
      this.attribute('memberOf', 'dn_array');
      
      this.attribute('userAccountControl', String); //'account_control');
      
      
      this.belongsTo('ou', {ldap: 'parent'});
      this.belongsToMany('groups', {ldap: 'memberOf'});
      
      
      
      
      
      this.checkPassword = function(password, callback){
        var user = this;
        
        //we need to create a new connection... and use bind() to check the password        
        var client = ldap.createClient({
          url: store.config.url,
          tlsOptions: store.config.tlsOptions,
        });
        
        client.bind(user.dn, password, function(err) {
          if(err){
            store.logger.info('ActiveDirectory bind failed:' + err.message);
            callback.call(user, false);
          }else{
            callback.call(user, true);
          }
          
          client.unbind();
        });
        
      };
      
      
      
      this.convertWrite('unicodePwd', function(password){
        //convert password to AD format:
        var converted_password = '';
        password = '"' + password + '"';

        for(var i = 0; i < password.length; i++){
          converted_password += String.fromCharCode( password.charCodeAt(i) & 0xFF,(password.charCodeAt(i) >>> 8) & 0xFF);
        }

        return converted_password;
      });
      
      
      
      this.beforeFind(function(){
        if(this.getInternal('without_object_class') !== true){
           this.where({objectClass_not:'computer'});         
        }
      })
      
       
    });
    
  }
}