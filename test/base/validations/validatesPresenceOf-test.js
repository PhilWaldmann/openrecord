var should = require('should')

var Store = require('../../../lib/store')


describe('validatesPresenceOf()', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('email', String)
    this.validatesPresenceOf('email')
  })

  var User, valid, invalid
  before(function(next){
    store.ready(function(){
      User = store.Model('User')
      valid = new User({email: 'philipp@email.com'})
      invalid = new User()

      next()
    })
  })


  it('exists', function(){
    should.exist(valid.isValid)
    valid.isValid.should.be.a.Function()
  })

  it('returns true on valid records', function(done){
    valid.isValid(function(valid){
      valid.should.be.equal(true)
      done()
    })
  })

  it('returns false on invalid records', function(done){
    invalid.isValid(function(valid){
      valid.should.be.equal(false)
      done()
    })
  })

  it('returns the right error message', function(done){
    invalid.isValid(function(valid){
      invalid.errors.should.have.property('email')
      done()
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
    before(function(next){
      store.ready(function(){
        User = store.Model('User')
        valid = new User({email: 'philipp@email.com', login: 'phil'})
        invalid = new User({login: 'phil'})

        next()
      })
    })


    it('returns true on valid records', function(done){
      valid.isValid(function(valid){
        valid.should.be.equal(true)
        done()
      })
    })

    it('returns false on invalid records', function(done){
      invalid.isValid(function(valid){
        valid.should.be.equal(false)
        done()
      })
    })

    it('returns the right error message', function(done){
      invalid.isValid(function(valid){
        invalid.errors.should.have.property('email')
        done()
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
    before(function(next){
      store.ready(function(){
        User = store.Model('User')
        valid = new User({email: 'philipp@email.com', login: 'phil'})
        invalid = new User({login: 'phil'})

        next()
      })
    })


    it('returns true on valid records', function(done){
      valid.isValid(function(valid){
        valid.should.be.equal(true)
        done()
      })
    })

    it('returns false on invalid records', function(done){
      invalid.isValid(function(valid){
        valid.should.be.equal(false)
        done()
      })
    })

    it('returns the right error message', function(done){
      invalid.isValid(function(valid){
        invalid.errors.should.have.property('email')
        done()
      })
    })
  })
})
