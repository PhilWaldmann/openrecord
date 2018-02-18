var Store = require('../../../store/base')


describe('validatesInclusionOf()', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('state', String)
    this.validatesInclusionOf('state', ['okay', 'failed', 'processing'])
  })

  var User, valid, invalid
  before(function(){
    return store.ready(function(){
      User = store.Model('User')
      valid = new User({state: 'okay'})
      invalid = new User({state: 'unknown'})
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
      invalid.errors.toJSON().should.have.property('state')
    })
  })

  describe('with fields array', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('state', String)
      this.attribute('state2', String)
      this.validatesInclusionOf(['state', 'state2'], ['okay', 'failed', 'processing'])
    })

    var User, valid, invalid, invalid2
    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        valid = new User({state: 'okay'})
        invalid = new User({state: 'unknown'})
        invalid2 = new User({state: 'unknown2', state2: 'something else'})
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
        invalid.errors.toJSON().should.have.property('state')
      })
    })
  })
})
