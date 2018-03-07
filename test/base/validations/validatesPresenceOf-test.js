var should = require('should')

var Store = require('../../../store/base')


describe('validatesPresenceOf()', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('email', String)
    this.validatesPresenceOf('email')
  })

  var User, valid, invalid
  before(function(){
    return store.ready(function(){
      User = store.Model('User')
      valid = new User({email: 'philipp@email.com'})
      invalid = new User()
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






  describe('with multiple params', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('login', String)
      this.attribute('email', String)
      this.validatesPresenceOf('email', 'login')
    })

    var User, valid, invalid
    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        valid = new User({email: 'philipp@email.com', login: 'phil'})
        invalid = new User({login: 'phil'})
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

    it('returns the right error message', function(){
      return invalid.isValid(function(valid){
        invalid.errors.toJSON().should.have.property('email')
      })
    })
  })



  describe('with array params', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('login', String)
      this.attribute('email', String)
      this.validatesPresenceOf(['email', 'login'])
    })

    var User, valid, invalid
    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        valid = new User({email: 'philipp@email.com', login: 'phil'})
        invalid = new User({login: 'phil'})
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

    it('returns the right error message', function(){
      return invalid.isValid(function(valid){
        invalid.errors.toJSON().should.have.property('email')
      })
    })
  })
})
