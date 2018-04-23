var Store = require('../../../lib/store')

describe('LDAP Client: Includes', function() {
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

      this.hasParent('ou')
      this.hasMany('groups', { from: 'dn', to: 'member' })
    })

    store.Model('Group', function() {
      this.attribute('name', String)
      this.attribute('member', 'dn_array')

      this.hasParent('ou')
      this.belongsToMany('members', { from: 'member' })
    })

    store.Model('Ou', function() {
      this.isContainer('ou') // automatically creates `children` and `parent` relations

      this.hasChildren('users', {
        model: 'User',
        conditions: { objectClass: 'user' }
      })
      this.hasChildren('groups', {
        model: 'Group',
        conditions: { objectClass: 'group' }
      })
      this.hasMany('group_members', { through: 'groups', relation: 'members' })
    })
  })

  it('includes a belongsTo relation', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.include('ou').exec(function(users) {
        users.length.should.be.above(4)
        users[3]._ou.objectClass.should.be.eql(['ou'])
      })
    })
  })

  it('includes a belongsTo relations of one specific object', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.find('cn=susi, ou=others, dc=test')
        .include('ou')
        .exec(function(user) {
          user.username.should.be.equal('susi')
          user._ou.objectClass.should.be.eql(['ou'])
        })
    })
  })

  it('includes a parent container', function() {
    return store.ready(function() {
      var Ou = store.Model('Ou')
      return Ou.find('ou=guests, ou=others, dc=test')
        .include('parent')
        .exec(function(ou) {
          ou.dn.should.be.equal('ou=guests,ou=others,dc=test')
          ou._parent.objectClass.should.be.eql(['ou'])
        })
    })
  })

  it('includes all child objects', function() {
    return store.ready(function() {
      var Ou = store.Model('Ou')
      return Ou.find('ou=others, dc=test')
        .include('children')
        .exec(function(ou) {
          ou.dn.should.be.equal('ou=others,dc=test')
          ou.children.length.should.be.equal(3)
          ou.children[0].username.should.be.equal('susi')
        })
    })
  })

  it('includes a hasMany relation', function() {
    return store.ready(function() {
      var Ou = store.Model('Ou')
      return Ou.recursive(false)
        .include('users')
        .exec(function(ous) {
          ous.length.should.be.equal(4)
          ous[0].dn.should.be.equal('ou=others,dc=test')
          ous[0].users.length.should.be.equal(2)
        })
    })
  })

  it('includes a hasMany relation without results', function() {
    return store.ready(function() {
      var Ou = store.Model('Ou')
      return Ou.recursive(false)
        .include('groups')
        .exec(function(ous) {
          ous.length.should.be.equal(4)
          ous[0].groups.length.should.be.equal(0)
        })
    })
  })

  it('includes group members', function() {
    return store.ready(function() {
      var Group = store.Model('Group')
      return Group.include('members').exec(function(groups) {
        groups.length.should.be.equal(1)
        groups[0].members.length.should.be.equal(2)
        groups[0].members[0].username.should.be.equal('christian')
      })
    })
  })

  it('includes all groups of users', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.include('groups').exec(function(users) {
        users.length.should.be.above(5)
        users[4].groups.length.should.be.equal(1)
        users[5].groups.length.should.be.equal(1)
      })
    })
  })

  it('includes all members of ou groups', function() {
    return store.ready(function() {
      var Ou = store.Model('Ou')
      return Ou.include('group_members').exec(function(ous) {
        ous.length.should.be.above(2)
        ous[2]._group_members.length.should.be.equal(2)
      })
    })
  })
})
