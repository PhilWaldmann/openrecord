var should = require('should')

var Store = require('../../../lib/store')

describe('LDAP Client: Exec', function() {
  var store

  before(function() {
    store = new Store({
      type: 'ldap',
      url: 'ldap://0.0.0.0:1389',
      base: 'dc=test',
      user: 'cn=root',
      password: 'secret',
      autoSave: true
    })

    store.Model('User', function() {
      this.attribute('username')
    })

    store.Model('Ou', function() {
      this.rdnPrefix('ou')
    })
  })

  it('get all user objects of the root ou', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.recursive(false).exec(function(users) {
        users.length.should.be.equal(2)
      })
    })
  })

  it('user object has standard attributes', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.recursive(false).exec(function(users) {
        var user = users[0]

        user.dn.should.endWith('dc=test')
        user.objectClass.should.be.eql(['user'])
      })
    })
  })

  it('get all user objects!', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.exec(function(users) {
        users.length.should.be.above(4)
      })
    })
  })

  it('get all user objects of another ou', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.searchRoot('ou=others, dc=test').exec(function(users) {
        users.length.should.be.equal(2)
      })
    })
  })

  it('do a find on a not existing user object', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.find('ou=others, dc=test').exec(function(user) {
        should.not.exist(user)
      })
    })
  })
})
