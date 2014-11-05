var ldap = require('ldapjs');
var moment = require('moment');

exports.store = {
  mixinCallback: function(){
    //the GUID will be converted by ldapjs
    ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_D;
    
    
    this.addType('date', {
      read: function(value){
        if(value === null) return null;
        return new Date(value.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\.(.{2})$/, '$1.$2.$3 $4:$5:$6.$7'));
      },
      write: function(value){
        if(value === null) return null;
        return moment(value).format('YYYYMMDDHHmmss.S') + 'Z';
      }
    });
    
    
    //Windows timestamp (100 nanosecond passed since 1.1.1601 00:00:00) e.g. 129822505817745000
    this.addType('timestamp', {
      read: function(value){
        if(value === null) return null;
        return new Date(parseInt(value, 10) / 10000 - 11644473600000);
      },
      write: function(value){
        if(value === null) return null;
        return (11644473600000 + parseInt(moment(value).format('X'), 10) * 10000).toString();
      }
    });
    
    //Windows SID
    this.addType('sid', {
      read: function(value){
        
        if(value === null) return null;
        var hex = new Buffer(value, 'base64').toString('hex').toUpperCase();
        var parts = hex.match(/.{2}/g);
        var output = ['S'];

        output.push(parseInt(parts[0], 16));  
        output.push(parseInt(parts[7], 16));    

        for(i = 8; i<parts.length; i+=4){
          tmp = '';
          for(var x = 3; x >= 0; x--){
            tmp += parts[i + x];
          }
          output.push(parseInt(tmp, 16));
        }

        return output.join('-');
      },
      write: function(value){
        return value;
      }
    }, {binary: true});
    
  }
}