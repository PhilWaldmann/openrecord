var Store = require('../../../store/base')

describe('validatesFormatOf()', function() {
  var store = new Store()

  store.Model('User', function() {
    this.attribute('mail', String)
    this.validatesFormatOf('mail', 'email')
  })

  var User, valid, invalid
  before(function() {
    return store.ready(function() {
      User = store.Model('User')
      valid = new User({ mail: 'philipp@email.com' })
      invalid = new User({ mail: 'not.a.valid@email!' })
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
      invalid.errors.toJSON().should.have.property('mail')
    })
  })

  describe('with multiple params', function() {
    var store = new Store()

    store.Model('User', function() {
      this.attribute('email', String)
      this.attribute('login', String)
      this.attribute('user_url', String)
      this.attribute('user_ip', String)
      this.attribute('user_uuid', String)
      this.attribute('created_at', Date)
      this.attribute('blocked_at', Date)
      this.attribute('first_name', String)

      this.validatesFormatOf(['email', 'login'], 'email')
      this.validatesFormatOf('user_url', 'url')
      this.validatesFormatOf('user_ip', 'ip')
      this.validatesFormatOf('user_uuid', 'uuid')
      this.validatesFormatOf('created_at', 'date')
      this.validatesFormatOf('blocked_at', null)
      this.validatesFormatOf('first_name', '(P|p)hil.*')
    })

    var User, valid, invalid, invalid2
    before(function() {
      return store.ready(function() {
        User = store.Model('User')
        valid = new User({
          email: 'philipp@email.com',
          login: 'philipp@email.com',
          user_url: 'http://www.digitalbits.at',
          user_ip: '10.20.30.40',
          user_uuid: '550e8400-e29b-41d4-a716-446655440000',
          created_at: new Date(),
          blocked_at: null,
          first_name: 'Philipp'
        })
        invalid = new User({
          email: 'not.a.valid@email!',
          login: 'phil',
          user_url: 'http:www.digitalbits.at',
          user_ip: '10.620.30.40',
          user_uuid: '550e8400-ZZZZ-41d4-a716-446655440000',
          created_at: 'tomorrow',
          blocked_at: '2014-02-01',
          first_name: 'Alex'
        })

        invalid2 = new User({
          login: 'phil'
        })
      })
    })

    it('returns true on valid records', function() {
      return valid.isValid(function(_valid) {
        _valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function() {
      return invalid.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns false on invalid records (second field)', function() {
      return invalid2.isValid(function(valid) {
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function() {
      return invalid.isValid(function(valid) {
        const errors = invalid.errors.toJSON()
        errors.should.have.property('email')
        errors.should.have.property('user_url')
        errors.should.have.property('user_ip')
        errors.should.have.property('user_uuid')
        errors.should.have.property('created_at')
        errors.should.have.property('blocked_at')
        errors.should.have.property('first_name')
      })
    })
  })
})
