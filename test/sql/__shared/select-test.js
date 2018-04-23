var should = require('should')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Select', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {
        this.hasMany('posts')
        this.hasMany('threads')
        this.attribute('foo', Number)
      })
      store.Model('Post', function() {
        this.belongsTo('user')
        this.belongsTo('thread')
      })
      store.Model('Thread', function() {
        this.belongsTo('user')
        this.hasMany('posts')
      })
    })

    it('returns only selected fields', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1)
          .select('id', 'login')
          .exec(function(user) {
            user.login.should.be.equal('phil')
            should.not.exist(user.email)
          })
      })
    })

    it('works with joins (automatic asJson())', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1)
          .select('users.id', 'login', 'message')
          .join('posts')
          .exec(function(user) {
            user.id.should.be.equal(1)
            user.login.should.be.equal('phil')
            user.message.should.be.equal('first message')
          })
      })
    })

    it('works with aggregate functions', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.select('count(*) as count').exec(function(count) {
          count[0].count.should.be.equal(4)
        })
      })
    })

    it('returns renamed field with predefined attribute', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1)
          .select('id as foo')
          .exec(function(user) {
            user.foo.should.be.equal(1)
          })
      })
    })

    it('returns renamed field as raw value', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1)
          .select('id as bar')
          .asRaw()
          .exec(function(user) {
            user.bar.should.be.equal(1)
          })
      })
    })
  })
}
