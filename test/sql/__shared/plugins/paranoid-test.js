var should = require('should')
var Store = require('../../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Paranoid', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {
        this.paranoid()
      })
    })

    it('returns only records with deleted_at IS NULL', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.where({ login_not: 'hans' }).exec(function(records) {
          records.length.should.be.equal(2)
        })
      })
    })

    it('returns all records with withDeleted() scope', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.where({ login_not: 'hans' })
          .withDeleted()
          .exec(function(records) {
            records.length.should.be.equal(4)
          })
      })
    })

    it('"deletes" a record', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(5).exec(function(hans) {
          return hans.destroy().then(function() {
            return User.find(5).exec(function(delHans) {
              should.not.exist(delHans)

              return User.find(5)
                .withDeleted()
                .exec(function(existingHans) {
                  existingHans.login.should.be.equal('hans')
                  should.exist(existingHans.deleted_at)
                })
            })
          })
        })
      })
    })
  })
}
