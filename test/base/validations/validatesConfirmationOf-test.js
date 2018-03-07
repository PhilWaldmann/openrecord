var Store = require('../../../store/base')


describe('validatesConfirmationOf()', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('password', String)
    this.attribute('password_confirmation', String)
    this.validatesConfirmationOf('password')
  })

  var User, valid, invalid

  before(function(){
    return store.ready(function(){
      User = store.Model('User')
      valid = new User({password: 'my!secret?password', password_confirmation: 'my!secret?password'})
      invalid = new User({password: '1234', password_connfirmation: 'abc'})
    })
  })



  it('returns true on valid records', function(){
    return valid.isValid(function(valid){
      valid.should.be.equal(true)
    })
  })

  it('returns false on wrong confirmation', function(){
    return invalid.isValid(function(valid){
      valid.should.be.equal(false)
    })
  })

  it('returns the right error message', function(){
    return invalid.isValid(function(valid){
      invalid.errors.toJSON().should.have.property('password')
    })
  })



  describe('with multiple params', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('password', String)
      this.attribute('password_confirmation', String)
      this.attribute('email', String)
      this.attribute('email_confirmation', String)
      this.validatesConfirmationOf('password', 'email')
    })


    var User, valid, invalid

    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        valid = new User({password: 'my!secret?password', password_confirmation: 'my!secret?password', email: 'philipp@email.com', email_confirmation: 'philipp@email.com'})
        invalid = new User({password: '1234', password_connfirmation: 'abc', email: 'philipp@email.com', email_confirmation: 'philw@gmx.at'})
      })
    })


    it('returns true on valid records', function(){
      return valid.isValid(function(valid){
        valid.should.be.equal(true)
      })
    })

    it('returns false on wrong confirmation', function(){
      return invalid.isValid(function(valid){
        valid.should.be.equal(false)
      })
    })

    it('returns the right error message', function(){
      return invalid.isValid(function(valid){
        invalid.errors.toJSON().should.have.property('password')
        invalid.errors.toJSON().should.have.property('email')
      })
    })
  })
})
