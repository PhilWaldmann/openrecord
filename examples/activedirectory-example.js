var OpenRecord = require('openrecord');

var store = new OpenRecord({
  type: 'activedirectory',
  url: 'ldaps://domain.lan',
  user: 'Domain\\Administrator',
  password: 'password',
  base: 'dc=domain,dc=lan'
});


store.ready(function(){
  var User = store.Model('User');
  
  User.find('cn=Administrator,cn=Users,dc=domain,dc=lan').include('groups').exec(function(admin){
    console.log(admin);
    process.exit(0);
  });
  
});