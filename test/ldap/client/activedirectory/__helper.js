var ldap = require('ldapjs');
var async = require('async');
var client;


global.beforeActiveDirectory = function(config, objects, next){

  deleteAll(objects[0].dn, function(){
    createAll(objects, function(){
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
    tlsOptions: { 'rejectUnauthorized': false },
  };

  global.LDAP_BASE = process.env['AD_BASE'];


  //we use that client to create and destroy test entries
  client = ldap.createClient({
    url: config.url,
    bindDN: config.user,
    bindCredentials: config.password,
    tlsOptions: { 'rejectUnauthorized': false },
    maxConnections: 2
  });

  client.on('error', function(err) {
    throw err;
  });



  objects = flattenTestData(objects);

  require('../__shared/' + name + '-test')(
    'LDAP (ActiveDirectory)',
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




function flattenTestData(objects, parent_dn){
  var tmp = [];

  for(var i = 0; i < objects.length; i++){
    var obj = objects[i];

    if(parent_dn){
      obj.dn += ',' + parent_dn;
    }

    if(!obj.dn.toLowerCase().replace(' ', '').match(LDAP_BASE.toLowerCase().replace(' ', ''))){
      objects[i].dn += ',' + LDAP_BASE;
    }

    tmp.push(obj);

    if(obj.children){
      tmp = tmp.concat(flattenTestData(obj.children, obj.dn));
      delete obj.children;
    }

  }

  return tmp;
}




function deleteAll(base_dn, callback){
  client.search(base_dn, {scope: 'sub', attributes:['dn'], filter:'(objectClass=*)'}, [], function(err, res) {
    if (err) throw err;
    var results = [];

    res.on('searchEntry', function(entry) {
      results.push(entry.object.dn);
    });
    res.on('error', function(err) {
      if(err instanceof ldap.NoSuchObjectError){
        callback();
      }else{
        throw err;
      }
    });
    res.on('end', function(res) {

      results.reverse();
      var calls = [];

      for(var i = 0; i < results.length; i++){
        (function(result){
          calls.push(function(next){
            client.del(result, function(err){
              if(err) throw new Error('unable to destroy ' + result + ': ' + err)
              next();
            });
          });
        })(results[i]);
      }

      async.series(calls, callback);

    });
  });
}


function createAll(objects, callback){
  var calls = [];

  for(var i = 0; i < objects.length; i++){
    (function(obj){
      calls.push(function(next){
        var dn = obj.dn;
        delete obj.dn;

        client.add(dn, obj, function(err){
          if(err) throw new Error('unable to create ' + dn + ': ' + err)
          next();
        });
      });
    })(objects[i]);
  }

  async.series(calls, callback);
}
