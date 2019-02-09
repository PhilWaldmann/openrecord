var Store = require('../../../lib/store')

describe('LDAP Client: Create', function() {
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
      this.attribute('username', String)
      this.attribute('memberOf', 'dn_array')

      this.validatesPresenceOf('username')

      this.hasParent('ou')
      this.hasMany('groups', { container: 'children', to: 'member' })
    })

    store.Model('Group', function() {
      this.attribute('name', String)
      this.attribute('member', 'dn_array')

      this.hasParent('ou')
      this.belongsToMany('members', { from: 'member' })
    })

    store.Model('Ou', function() {
      this.isContainer('ou')
      this.attribute('name', String)
    })
  })

  it('creates a new record with a dn', function() {
    return store.ready(function() {
      var User = store.Model('User')

      return User.create({
        dn: 'cn=fifi, ou=create, dc=test',
        username: 'fifi',
        age: 35
      }).then(function(user) {
        user.username.should.be.equal('fifi')
        return User.find('cn=fifi, ou=create, dc=test').exec(function(user) {
          user.username.should.be.equal('fifi')
        })
      })
    })
  })

  it('creates a new record with validation error', function() {
    return store
      .ready(function() {
        var User = store.Model('User')

        return User.create({ dn: 'cn=fifi2, ou=create, dc=test', age: 35 })
      })
      .should.be.rejectedWith(store.ValidationError, {
        errors: { username: ['should be present'] }
      })
  })

  it('creates nested records', function() {
    return store.ready(function() {
      var Ou = store.Model('Ou')
      var User = store.Model('User')

      var ou = Ou.new({ name: 'Sub', dn: 'ou=sub, ou=create, dc=test' })

      ou.children.add(
        User.new({
          cn: 'hugo',
          username: 'hugo',
          age: 44
        })
      )

      return ou.save().then(function(result) {
        result.name.should.be.equal('Sub')

        return Ou.find('ou=sub, ou=create, dc=test')
          .include('children')
          .exec(function(ou) {
            ou.name.should.be.equal('Sub')
            ou.children.length.should.be.equal(1)
            ou.children[0].username.should.be.equal('hugo')
          })
      })
    })
  })
})
