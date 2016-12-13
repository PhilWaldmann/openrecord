var ldap = require('ldapjs');

var SUFFIX = 'dc=test';
var db = {
  'dc=test': {},
  'cn=phil,dc=test': {
    username: 'phil',
    objectclass: 'user',
    age: 26
  },
  'cn=michl,dc=test': {
    username: 'michl',
    objectclass: 'user',
    age: 29
  },

  //OU Others
  'ou=others,dc=test': {
    name: 'Others',
    objectclass: 'ou'
  },
  'cn=susi,ou=others,dc=test': {
    username: 'susi',
    objectclass: 'user',
    age: 25
  },
  'cn=max,ou=others,dc=test': {
    username: 'max',
    objectclass: 'user',
    age: 47
  },

  //OU Others/Guests
  'ou=guests,ou=others,dc=test': {
    name: 'Guests',
    objectclass: 'ou'
  },

  //OU Others/Guests/Archive
  'ou=archive,ou=guests,ou=others,dc=test': {
    name: 'Archive',
    objectclass: 'ou'
  },

  'cn=archive_group,ou=archive,ou=guests,ou=others,dc=test': {
    name: 'Archive Group',
    objectclass: 'group',
    member: ['cn=christian,ou=archive,ou=guests,ou=others,dc=test','cn=ulli,ou=archive,ou=guests,ou=others,dc=test']
  },

  'cn=christian,ou=archive,ou=guests,ou=others,dc=test': {
    username: 'christian',
    objectclass: 'user',
    age: 32,
    memberOf:['cn=archive_group,ou=archive,ou=guests,ou=others,dc=test','cn=not_existing_group,ou=others,dc=test']
  },

  'cn=ulli,ou=archive,ou=guests,ou=others,dc=test': {
    username: 'ulli',
    objectclass: 'user',
    age: 25,
    memberOf:['cn=archive_group,ou=archive,ou=guests,ou=others,dc=test']
  },

  'cn=matt,ou=archive,ou=guests,ou=others,dc=test': {
    username: 'matt',
    objectclass: 'user'
  },


  //OU Create
  'ou=create,dc=test': {
    name: 'Create',
    objectclass: 'ou'
  },


  //OU Update
  'ou=update,dc=test': {
    name: 'Update',
    objectclass: 'ou'
  },
  'ou=target,ou=update,dc=test': {
    name: 'Target',
    objectclass: 'ou'
  },
  'cn=change_me,ou=update,dc=test': {
    username: 'change_me',
    objectclass: 'user',
    age: 99
  },
  'cn=move_me,ou=update,dc=test': {
    username: 'move_me',
    objectclass: 'user',
    age: 99
  },
  'cn=move_and_update_me,ou=update,dc=test': {
    username: 'move_and_update_me',
    objectclass: 'user',
    age: 99
  },


  //OU Destroy
  'ou=destroy,dc=test': {
    name: 'Destroy',
    objectclass: 'ou'
  },
  'cn=destroy_me,ou=destroy,dc=test': {
    username: 'destroy_me',
    objectclass: 'user',
    age: 99
  },
};



before(function(done){

  ///--- Globals


  var server = ldap.createServer();

  server.bind('cn=root', function (req, res, next) {
    if (req.dn.toString() !== 'cn=root' || req.credentials !== 'secret')
      return next(new ldap.InvalidCredentialsError());

    res.end();
    return next();
  });

  server.add(SUFFIX, authorize, function (req, res, next) {
    var dn = req.dn.toString().replace(/\, /g, ',').toLowerCase();
    if (db[dn])
      return next(new ldap.EntryAlreadyExistsError(dn));

    db[dn] = req.toObject().attributes;

    res.end();
    return next();
  });

  server.bind(SUFFIX, function (req, res, next) {
    var dn = req.dn.toString().replace(/\, /g, ',').toLowerCase();
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));

    if (!db[dn].userpassword)
      return next(new ldap.NoSuchAttributeError('userPassword'));

    if (db[dn].userpassword.indexOf(req.credentials) === -1)
      return next(new ldap.InvalidCredentialsError());

    res.end();
    return next();
  });

  server.compare(SUFFIX, authorize, function (req, res, next) {
    var dn = req.dn.toString().replace(/\, /g, ',').toLowerCase();
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));

    if (!db[dn][req.attribute])
      return next(new ldap.NoSuchAttributeError(req.attribute));

    var matches = false;
    var vals = db[dn][req.attribute];
    for (var i = 0; i < vals.length; i++) {
      if (vals[i] === req.value) {
        matches = true;
        break;
      }
    }

    res.end(matches);
    return next();
  });

  server.del(SUFFIX, authorize, function (req, res, next) {
    var dn = req.dn.toString().replace(/\, /g, ',').toLowerCase();
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));

    delete db[dn];

    res.end();
    return next();
  });

  server.modifyDN(SUFFIX, function(req, res, next) {
    var dn = req.dn.toString().replace(/\, /g, ',').toLowerCase();
    var new_dn = req.newRdn.toString() + ', ' + req.dn.parent().toString()

    if(!db[dn]){
      return next(new ldap.NoSuchObjectError(req.newSuperior.toString()));
    }

    if(req.newSuperior){
      if(!db[req.newSuperior.toString()]){
        return next(new ldap.NoSuchObjectError(req.newSuperior.toString()));
      }

      new_dn = req.newRdn.toString() + ', ' + req.newSuperior.toString();
    }

    new_dn = new_dn.replace(/\, /g, ',').toLowerCase();

    db[new_dn] = db[dn];

    if(req.deleteOldRdn){
      delete db[dn];
    }

    res.end();
  });

  server.modify(SUFFIX, authorize, function (req, res, next) {
    var dn = req.dn.toString().replace(/\, /g, ',').toLowerCase();
    if (!req.changes.length)
      return next(new ldap.ProtocolError('changes required'));
    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));

    var entry = db[dn];

    for (var i = 0; i < req.changes.length; i++) {
      mod = req.changes[i].modification;
      switch (req.changes[i].operation) {
      case 'replace':
        if (!entry[mod.type]){
          console.log('REPLACE', req.changes[i].json);
          return next(new ldap.NoSuchAttributeError(mod.type));
        }


        if (!mod.vals || !mod.vals.length) {
          delete entry[mod.type];
        } else {
          entry[mod.type] = mod.vals;
        }

        break;

      case 'add':
        if (!entry[mod.type]) {
          entry[mod.type] = mod.vals;
        } else {
          mod.vals.forEach(function (v) {
            if (entry[mod.type].indexOf(v) === -1)
              entry[mod.type].push(v);
          });
        }

        break;

      case 'delete':
        if (!entry[mod.type])
          return next(new ldap.NoSuchAttributeError(mod.type));

        delete entry[mod.type];

        break;
      }
    }

    res.end();
    return next();
  });

  server.search(SUFFIX, authorize, function (req, res, next) {
    var dn = req.dn.toString().replace(/\, /g, ',').toLowerCase();

    if (!db[dn])
      return next(new ldap.NoSuchObjectError(dn));

    var scopeCheck;

    switch (req.scope) {
    case 'base':
      if (req.filter.matches(db[dn])) {
        res.send({
          dn: dn,
          attributes: db[dn]
        });
      }

      res.end();
      return next();

    case 'one':
      scopeCheck = function (k) {
        if (req.dn.equals(k))
          return true;

        var parent = ldap.parseDN(k).parent();
        return (parent ? parent.equals(req.dn) : false);
      };
      break;

    case 'sub':
      scopeCheck = function (k) {
        return (req.dn.equals(k) || req.dn.parentOf(k));
      };

      break;
    }

    Object.keys(db).forEach(function (key) {

      if (!scopeCheck(key))
        return;

      if (req.filter.matches(db[key])) {
        res.send({
          dn: key,
          attributes: db[key]
        });
      }
    });

    res.end();
    return next();
  });

  server.listen(1389, function () {
    done();
  });
});



///--- Shared handlers

function authorize(req, res, next) {
  /* Any user may search after bind, only cn=root has full power */
  var isSearch = (req instanceof ldap.SearchRequest);
  if (!req.connection.ldap.bindDN.equals('cn=root') && !isSearch)
    return next(new ldap.InsufficientAccessRightsError());

  return next();
}
