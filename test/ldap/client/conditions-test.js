var Store = require('../../../lib/store')

describe('LDAP Client: Conditions', function() {
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
      this.attribute('age', Number)
    })

    store.Model('Ou', function() {
      this.rdnPrefix('ou')
    })
  })

  it('get all user objects with equal condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ username: 'phil' }).then(function(users) {
        users.length.should.be.equal(1)
        users[0].username.should.be.equal('phil')
      })
    })
  })

  it('get all user objects with equal array condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ username: ['michl', 'phil'] }).then(function(users) {
        users.length.should.be.equal(2)
        users[0].username.should.be.equal('phil')
        users[1].username.should.be.equal('michl')
      })
    })
  })

  it('get all user objects with equal array, not equal condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ username: ['michl', 'phil'] })
        .where({ username_not: 'phil' })
        .then(function(users) {
          users.length.should.be.equal(1)
          users[0].username.should.be.equal('michl')
        })
    })
  })

  it('get all user objects with not equal array condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ username_not: ['michl', 'phil'] }).then(function(
        users
      ) {
        users.length.should.be.above(2)
        users[0].username.should.be.equal('susi')
        users[1].username.should.be.equal('max')
      })
    })
  })

  it('get all user objects with like condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ username_like: 'ph' }).then(function(users) {
        users.length.should.be.equal(1)
        users[0].username.should.be.equal('phil')
      })
    })
  })

  it('get all user objects with like array condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ username_like: ['ph', 'mi'] }).exec(function(users) {
        users.length.should.be.equal(2)
        users[0].username.should.be.equal('phil')
        users[1].username.should.be.equal('michl')
      })
    })
  })

  it('get all user objects with >= condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ age_gte: 29 }).exec(function(users) {
        users.length.should.be.equal(7)
        users[0].username.should.be.equal('michl')
        users[1].username.should.be.equal('max')
        users[2].username.should.be.equal('christian')
      })
    })
  })

  it('get all user objects with > condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ age_gt: 29 }).exec(function(users) {
        users.length.should.be.equal(6)
      })
    })
  })

  it('get all user objects with <= condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ age_lte: 29 }).exec(function(users) {
        users.length.should.be.equal(5) // 4 users age <= 29 + 1 without age
      })
    })
  })

  it('get all user objects with <= condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ age_lt: 29 }).exec(function(users) {
        users.length.should.be.equal(4) // null is greater and lower than 29?!? whoot?
        users[0].username.should.be.equal('phil')
        users[1].username.should.be.equal('susi')
        users[2].username.should.be.equal('ulli')
      })
    })
  })

  it('get all user objects with between condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ age_between: [29, 31] }).exec(function(users) {
        users.length.should.be.equal(1)
        users[0].username.should.be.equal('michl')
      })
    })
  })

  it('get all user objects with null condition', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.where({ age: null }).exec(function(users) {
        users.length.should.be.equal(1)
        users[0].username.should.be.equal('matt')
      })
    })
  })
})
