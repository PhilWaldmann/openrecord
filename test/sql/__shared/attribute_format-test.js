var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Attribute Format', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      storeConf.internalAttributeName = function(name){
        return name.replace(/\.?([A-Z]+)/g, function (x, char){
          return '_' + char.toLowerCase()
        }).replace(/^_/, '')
      }

      storeConf.externalAttributeName = function(name){
        return name.toLowerCase().replace(/_(.)/g, function(match, char) {
          return char.toUpperCase()
        })
      }

      store = new Store(storeConf)

      store.Model('User', function() {
        this.hasMany('posts')
      })

      store.Model('Post', function() {
        this.belongsTo('user')
        this.belongsTo('thread')
      })

      store.Model('Thread', function() {
        this.hasMany('posts')
      })
    })

    it('has the original attribute names', function() {
      return store.ready(function() {
        var User = store.Model('User')

        var attrs = User.definition.attributes
        attrs.should.have.keys('user_login', 'secret_email_address')
      })
    })

    it('has camelCase attribute accessors', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1)
        .then(function(user){
          user.userLogin.should.be.equal('phil')
          user.secretEmailAddress.should.be.equal('phil@mail.com')
        })
      })
    })

    it('uses toInternalAttribute for create', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.create({userLogin: 'michl', secretEmailAddress: 'michl@mail.com'})
        .then(function(user){
          user.id.should.be.equal(2)
          user.userLogin.should.be.equal('michl')
          user.secretEmailAddress.should.be.equal('michl@mail.com')
        })
      })
    })

    it('uses toInternalAttribute for update', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1)
        .then(function(user){
          user.userLogin = 'philipp'
          user.secretEmailAddress = 'philipp@mail.com'
          return user.save()
        })
        .then(function(user){
          user.id.should.be.equal(1)
          user.userLogin.should.be.equal('philipp')
          user.secretEmailAddress.should.be.equal('philipp@mail.com')
        })
      })
    })

    it('returns raw object without converted attribute names', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1).asRaw()
        .then(function(user){
          user.user_login.should.be.equal('philipp')
          user.secret_email_address.should.be.equal('philipp@mail.com')
        })
      })
    })

    it('JSON.stringify returns uses converted attribute names', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1)
        .then(function(user){
          JSON.stringify(user).should.be.equal('{"postIds":null,"id":1,"userLogin":"philipp","secretEmailAddress":"philipp@mail.com"}')
        })
      })
    })

    it('external attribute names work with conditions', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.where({userLogin_like: 'phil'})
        .then(function(users){
          users.length.should.be.equal(1)
        })
      })
    })

    it('external attribute names work with sorting', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.sort('secretEmailAddress')
        .then(function(users){
          users.length.should.be.equal(2)
        })
      })
    })

    it('external attribute names work with includes', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.include('posts').order('id')
        .then(function(users){
          users.length.should.be.equal(2)
          users[0].posts.length.should.be.equal(3)
        })
      })
    })

    it('external attribute names work with joins', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.join('posts')
        .then(function(users){
          users.length.should.be.equal(2)
          users[0].posts.length.should.be.equal(3)
        })
      })
    })
  })
}
