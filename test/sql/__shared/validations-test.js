var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Validation', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {
        this.validatesUniquenessOf('login', 'email')

        this.beforeValidation(function() {
          this.save.should.be.a.Function()
          if (this.login === 'max') throw new Error('stop')
        })
      })
      store.Model('MultipleKey', function() {
        this.validatesUniquenessOf('name')
      })
      store.Model('WithArray', function() {
        this.validatesUniquenessOf(['login', 'email']).validatesFormatOf(
          'email',
          /^[^@\s;]+@[^@\s;]+\.[^@\s;]+$/
        )
      })
      store.Model('WithScope', function() {
        this.validatesUniquenessOf('name', { scope: 'scope_id' })
      })
    })

    describe('beforeValidation()', function() {
      it('gets called on create', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.create({ login: 'max' })
          })
          .should.be.rejectedWith(Error, { message: 'stop' })
      })

      it('gets called on update', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.find(1).then(function(phil) {
              phil.login = 'max'
              return phil.save()
            })
          })
          .should.be.rejectedWith(Error, { message: 'stop' })
      })
    })

    describe('validatesUniquenessOf()', function() {
      it('returns false on duplicate entries (create)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var phil2 = User.new({
            login: 'phil'
          })

          return phil2.isValid(function(valid) {
            valid.should.be.equal(false)
          })
        })
      })

      it('returns false on duplicate entries (create, with array syntax)', function() {
        return store.ready(function() {
          var WithArray = store.Model('WithArray')
          var phil2 = WithArray.new({
            login: 'phil',
            email: 'phil@mail.com'
          })

          return phil2.isValid(function(valid) {
            valid.should.be.equal(false)
          })
        })
      })

      it('returns true on valid entry (create)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var phil2 = User.new({
            login: 'phil2'
          })

          return phil2.isValid(function(valid) {
            valid.should.be.equal(true)
          })
        })
      })

      it('returns false on duplicate entries (update)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var phil2 = User.new({
            id: 5,
            login: 'phil'
          })

          return phil2.isValid(function(valid) {
            valid.should.be.equal(false)
          })
        })
      })

      it('returns true on valid entry (update)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var phil2 = User.new({
            id: 1,
            login: 'phil'
          })

          return phil2.isValid(function(valid) {
            valid.should.be.equal(true)
          })
        })
      })

      it('works with multiple primaryKeys (create)', function() {
        return store.ready(function() {
          var MultipleKey = store.Model('MultipleKey')
          var phil = MultipleKey.new({
            id: 5,
            id2: 5,
            name: 'phil'
          })

          return phil.isValid(function(valid) {
            valid.should.be.equal(false)
          })
        })
      })

      it('works with multiple primaryKeys (update)', function() {
        return store.ready(function() {
          var MultipleKey = store.Model('MultipleKey')
          var phil = MultipleKey.new({
            id: 1,
            id2: 1,
            name: 'phil'
          })

          return phil.isValid(function(valid) {
            valid.should.be.equal(true)
          })
        })
      })

      it('returns false with scopes (create)', function() {
        return store.ready(function() {
          var WithScope = store.Model('WithScope')
          var phil = WithScope.new({
            name: 'phil',
            scope_id: 1
          })

          return phil.isValid(function(valid) {
            valid.should.be.equal(false)
          })
        })
      })

      it('returns true with scopes (create)', function() {
        return store.ready(function() {
          var WithScope = store.Model('WithScope')
          var phil = WithScope.new({
            name: 'michl',
            scope_id: 2
          })

          return phil.isValid(function(valid) {
            valid.should.be.equal(true)
          })
        })
      })

      it('returns false with scopes (update)', function() {
        return store.ready(function() {
          var WithScope = store.Model('WithScope')
          var phil = WithScope.new({
            id: 2,
            name: 'phil',
            scope_id: 1
          })

          return phil.isValid(function(valid) {
            valid.should.be.equal(false)
          })
        })
      })

      it('returns true with scopes (update)', function() {
        return store.ready(function() {
          var WithScope = store.Model('WithScope')
          var phil = WithScope.new({
            id: 1,
            name: 'phil',
            scope_id: 1
          })

          return phil.isValid(function(valid) {
            valid.should.be.equal(true)
          })
        })
      })
    })
  })
}
