var exec = require('child_process').exec;

global.beforeActiveDirectory = function(config, objects, next){
  var user = config.user;
  var data = [];
  var base_dn  = "'" + objects[0].dn + "'";
  
  for(var i = 0; i < objects.length; i++){
    data.push("'" + JSON.stringify(objects[i]) + "'");
  }
  
  data = data.join(' ');
  
  var destroy_all = function(callback){
    exec('./node_modules/ldapjs/bin/ldapjs-search --base ' + base_dn + ' --binddn ' + user + ' --password ' + config.password + ' --url ' + config.url + ' --scope sub \'(objectClass=*)\' dn | grep dn', function(err, result){
      var dn = result.replace(/(  "dn": "|",)/g, '').split('\n').reverse().slice(1);
      if(dn.length === 0) return callback();
      
      dn = "'" + dn.join("' '") + "'";
      
      exec('./node_modules/ldapjs/bin/ldapjs-delete --binddn ' + user + ' --password ' + config.password + ' --url ' + config.url + ' ' + dn, function(err, result){
        callback();
      });
    })
  }
  
  destroy_all(function(){
    exec('./node_modules/ldapjs/bin/ldapjs-add --binddn ' + user + ' --password ' + config.password + ' --url ' + config.url + ' ' + data, function(err){
      if(err && err.message != 'Command failed: read ECONNRESET\n') throw new Error(err);
      next();   
    });
  });
  
  
};

global.afterActiveDirectory = function(db, next){
  next();
};

global.testActiveDirectory = function(name, objects){
  
  if(!process.env['AD_URL'] || !process.env['AD_USER'] || !process.env['AD_PASSWORD'] || !process.env['AD_BASE']){
    console.log('Specify AD_URL=ldap://your.domain AD_USER=DOMAIN\\Administrator AD_PASSWORD=mysecret AD_BASE=dc=your,dc=domain');
    return;
  }
  
  var config = {
    url: process.env['AD_URL'], 
    type: 'activedirectory',
    user: process.env['AD_USER'],
    password: process.env['AD_PASSWORD'],
    base: process.env['AD_BASE'],
  };
  
  require('../__shared/' + name + '-test')(
    'ActiveDirectory', 
    function(next){
      beforeActiveDirectory(config, objects, next);
    },
    function(next, store){
      //store.close(function(){
      //  
      //});
      afterActiveDirectory(config, next);
    },
    config);
}