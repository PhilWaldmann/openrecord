var Store = require('../../../store/base')


describe('validatesInclusionOf()', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('state', String)
    this.validatesInclusionOf('state', ['okay', 'failed', 'processing'])
  })

  var User, valid, invalid
  before(function(next){
    store.ready(function(){
      User = store.Model('User')
      valid = new User({state: 'okay'})
      invalid = new User({state: 'unknown'})

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
      invalid.errors.should.have.property('state')
      done()
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
    before(function(next){
      store.ready(function(){
        User = store.Model('User')
        valid = new User({state: 'okay'})
        invalid = new User({state: 'unknown'})
        invalid2 = new User({state: 'unknown2', state2: 'something else'})

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

    it('returns false on invalid records (second field)', function(done){
      invalid2.isValid(function(valid){
        valid.should.be.equal(false)
        done()
      })
    })

    it('returns the right error message', function(done){
      invalid.isValid(function(valid){
        invalid.errors.should.have.property('state')
        done()
      })
    })
  })
})
