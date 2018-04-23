var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Data Types', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {})
    })

    describe('cast()', function() {
      it('casts BLOB to string', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.definition
            .cast('my_blob', 45454, 'read')
            .should.be.equal('45454')
        })
      })

      it('casts INTEGER to number', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.definition
            .cast('my_integer', '123.55', 'read')
            .should.be.equal(123)
        })
      })

      it('casts REAL to float', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.definition
            .cast('my_real', '123.55', 'read')
            .should.be.equal(123.55)
        })
      })
    })
  })
}
