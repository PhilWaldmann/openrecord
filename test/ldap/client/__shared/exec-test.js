var should = require('should')
var Store = require('../../../../lib/store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Exec (' + storeConf.url + ')', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)
    })

    it('get all ou objects of the base ou', function() {
      return store.ready(function() {
        var Ou = store.Model('OrganizationalUnit')
        return Ou.searchRoot('ou=openrecord,' + LDAP_BASE).exec(function(ous) {
          ous.length.should.be.equal(1)
          ous[0].name.should.be.equal('exec_test')
        })
      })
    })

    it('get all ou objects of the base ou incl. child objects', function() {
      return store.ready(function() {
        var Ou = store.Model('OrganizationalUnit')
        return Ou.searchRoot('ou=openrecord,' + LDAP_BASE, true).exec(function(
          ous
        ) {
          ous.length.should.be.equal(6)
          ous[0].name.should.be.equal('openrecord')
        })
      })
    })

    it('get all ou objects of the base ou inkl. child objects (recursive)', function() {
      return store.ready(function() {
        var Ou = store.Model('OrganizationalUnit')
        return Ou.searchRoot('ou=openrecord,' + LDAP_BASE)
          .recursive()
          .exec(function(ous) {
            ous.length.should.be.equal(6)
            ous[0].name.should.be.equal('openrecord')
          })
      })
    })

    it('get all user objects of base ou', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.searchRoot('ou=openrecord,' + LDAP_BASE).exec(function(
          users
        ) {
          users.length.should.be.equal(0)
        })
      })
    })

    it('get all user objects of base ou incl. child objects', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.searchRoot('ou=openrecord,' + LDAP_BASE, true).exec(
          function(users) {
            users.length.should.be.equal(6)
          }
        )
      })
    })

    it('get all user objects of one ou', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.searchRoot(
          'ou=sub_ou1,ou=exec_test,ou=openrecord,' + LDAP_BASE
        ).exec(function(users) {
          users.length.should.be.equal(3)
        })
      })
    })

    it('returns null on wrong searchRoot', function() {
      // TODO: this should instead throw an error - right?
      return store.ready(function() {
        var User = store.Model('User')
        return User.searchRoot('ou=unknown,ou=openrecord,' + LDAP_BASE).exec(
          function(users) {
            should.not.exist(users)
          }
        )
      })
    })

    it('user object has standard attributes', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.searchRoot(
          'ou=sub_ou3,ou=exec_test,ou=openrecord,' + LDAP_BASE
        ).exec(function(users) {
          var user = users[0]
          user.dn.should.endWith(LDAP_BASE.toLowerCase())
          user.givenName.should.be.equal('first name')
          user.sn.should.be.equal('last name')
          user.sAMAccountName.should.be.equal('test_samaccountname')
          user.objectGUID.should.match(
            /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{11}/
          )
          user.objectSid.should.match(
            /S-\d-\d-\d{2}-\d{10}-\d{8,10}-\d{8,10}-\d{3,6}/
          )
          user.attributes.whenChanged.should.be.instanceOf(Date) // will be handled internally as a date
          should.not.exist(user.attributes.accountExpires)
          user.objectClass.should.endWith('user')
        })
      })
    })

    it('do a find on a not existing user object', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(
          'cn=unknown,ou=exec_test,ou=openrecord,' + LDAP_BASE
        ).exec(function(user) {
          should.not.exist(user)
        })
      })
    })

    it('do a find without null params returns null', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(null).exec(function(user) {
          should.not.exist(user)
        })
      })
    })

    it('find with objectGUID', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(
          'cn=openerecord_test_user6,ou=sub_ou3,ou=exec_test,ou=openrecord,' +
            LDAP_BASE
        ).exec(function(user) {
          return User.where({ objectGUID: user.objectGUID }).exec(function(
            sameUsers
          ) {
            user.dn.should.be.equal(sameUsers[0].dn)
          })
        })
      })
    })
  })
}
