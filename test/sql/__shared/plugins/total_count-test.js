var Store = require('../../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': totalCount', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {})
    })

    it('returns the total count', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.totalCount().then(function(count) {
          count.should.be.equal(5)
        })
      })
    })

    it('returns the total count by field', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.totalCount('deleted_at').then(function(count) {
          count.should.be.equal(2)
        })
      })
    })

    it('ignores invalid field names', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.totalCount({}).then(function(count) {
          count.should.be.equal(5)
        })
      })
    })

    it('resets limit', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.limit(2)
          .totalCount()
          .then(function(count) {
            count.should.be.equal(5)
          })
      })
    })

    it('resets limit (called after)', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.totalCount()
          .limit(2)
          .then(function(count) {
            count.should.be.equal(5)
          })
      })
    })
  })
}
