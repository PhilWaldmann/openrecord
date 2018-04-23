var should = require('should')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Attributes', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {})
      store.Model('MultipleKey', function() {})
    })

    it('has the right primary_key', function() {
      return store.ready(function() {
        var User = store.Model('User')

        var primaryKeys = User.definition.primaryKeys
        primaryKeys.should.be.eql(['id'])
      })
    })

    it('has multiple primaryKeys', function() {
      return store.ready(function() {
        var MultipleKey = store.Model('MultipleKey')

        var primaryKeys = MultipleKey.definition.primaryKeys
        primaryKeys.should.be.eql(['id', 'id2'])
      })
    })

    it('has NOT NULL attributes', function() {
      return store.ready(function() {
        var User = store.Model('User')

        var attributes = User.definition.attributes
        attributes.login.notnull.should.be.equal(true)
      })
    })

    it('has automatic validation', function() {
      return store.ready(function() {
        var User = store.Model('User')
        var phil = User.new()

        return phil.isValid(function(valid) {
          valid.should.be.equal(false)
          phil.errors.toJSON().should.have.property('login')
        })
      })
    })

    it('loaded record to not have any changes', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(1).exec(function(result) {
          should.exist(result)
          result.hasChanges().should.be.equal(false)
          result.login.should.be.equal('phil')
        })
      })
    })

    it('create works', function() {
      return store.ready(function() {
        var User = store.Model('User')
        var phil = User.new({
          login: 'michl',
          not_in_the_database: 'foo'
        })

        return phil.save().then(function() {
          phil.id.should.be.equal(2)
        })
      })
    })
  })
}
