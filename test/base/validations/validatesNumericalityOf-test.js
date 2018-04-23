var Store = require('../../../store/base')

describe('validatesNumericalityOf()', function() {
  describe('allow_null', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.validatesNumericalityOf('attr', { allow_null: true, eq: 2 })
    })

    var User, valid, invalid
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User()
        invalid = new User({ attr: 99 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })

  describe('gt', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.validatesNumericalityOf('attr', { gt: 2 })
    })

    var User, valid, invalid
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({ attr: 10 })
        invalid = new User({ attr: 2 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })

  describe('gte', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.validatesNumericalityOf('attr', { gte: 2 })
    })

    var User, valid, invalid
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({ attr: 2 })
        invalid = new User({ attr: 0 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })

  describe('gte', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.validatesNumericalityOf('attr', { lt: 3 })
    })

    var User, valid, invalid
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({ attr: 2 })
        invalid = new User({ attr: 3 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })

  describe('gte', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.validatesNumericalityOf('attr', { lte: 3 })
    })

    var User, valid, invalid
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({ attr: 3 })
        invalid = new User({ attr: 4 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })

  describe('gte', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.validatesNumericalityOf('attr', { even: true })
    })

    var User, valid, invalid
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({ attr: 4 })
        invalid = new User({ attr: 3 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })

  describe('gte', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.validatesNumericalityOf('attr', { odd: true })
    })

    var User, valid, invalid
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({ attr: 3 })
        invalid = new User({ attr: 4 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })

  describe('with fields array', function() {
    var store = new Store()
    store.Model('User', function() {
      this.attribute('attr', Number)
      this.attribute('attr2', Number)
      this.validatesNumericalityOf(['attr', 'attr2'], { odd: true })
    })

    var User, valid, invalid, invalid2
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({ attr: 3, attr2: 5 })
        invalid = new User({ attr: 4, attr2: 6 })
        invalid2 = new User({ attr: 3, attr2: 6 })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(valid) {
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns false on invalid records (second field)', function() {
      invalid2.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
        invalid.errors.toJSON().should.have.property('attr')
      })
    })
  })
})
