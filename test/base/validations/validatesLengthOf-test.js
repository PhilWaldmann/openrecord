var should = require('should')

var Store = require('../../../store/base')


describe('validatesLengthOf()', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('email', String)
    this.validatesLengthOf('email', 20)
  })

  var User, valid, invalid
  before(function(){
    return store.ready(function(){
      User = store.Model('User')
      valid = new User({email: 'philipp@email.com'})
      invalid = new User({email: 'philipps.superlong.email@email.com'})
    })
  })


  it('exists', function(){
    should.exist(valid.isValid)
    return valid.isValid.should.be.a.Function()
  })

  it('returns true on valid records', function(){
    return valid.isValid(function(valid){
      valid.should.be.equal(true)
    })
  })

  it('returns false on invalid records', function(){
    return invalid.isValid(function(valid){
      valid.should.be.equal(false)
    })
  })

  it('returns the right error message', function(){
    return invalid.isValid(function(valid){
      invalid.errors.toJSON().should.have.property('email')
    })
  })

  describe('with fields array', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('email', String)
      this.attribute('login', String)
      this.validatesLengthOf(['email', 'login'], 20)
    })

    var User, valid, invalid, invalid2
    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        valid = new User({email: 'philipp@email.com'})
        invalid = new User({email: 'philipps.superlong.email@email.com'})
        invalid2 = new User({email: 'fooo', login: 'philipps.superlong.email@email.com'})
      })
    })


    it('returns true on valid records', function(){
      return valid.isValid(function(valid){
        valid.should.be.equal(true)
      })
    })

    it('returns false on invalid records', function(){
      return invalid.isValid(function(valid){
        valid.should.be.equal(false)
      })
    })

    it('returns false on invalid records (second field)', function(){
      invalid2.isValid(function(valid){
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function(){
      return invalid.isValid(function(valid){
        invalid.errors.toJSON().should.have.property('email')
      })
    })
  })
})
