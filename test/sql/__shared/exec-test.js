var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Exec', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {})
    })

    it('throws an error on unknown table', function() {
      return store
        .ready(function() {
          var User = store.Model('User')
          return User.where({ login_like: 'phi' }).exec()
        })
        .should.be.rejectedWith(store.Error) // TODO: custom error!!
    })
  })
}
