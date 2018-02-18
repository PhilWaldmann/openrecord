var Store = require('../../store/base')

describe('Validation', function(){
  describe('validates()', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('login', String)

      this.validates('login', function(){
        var context = this
        context.should.have.property('login')

        return new Promise(function(resolve, reject){
          setTimeout(function(){
            if(context.login === 'admin'){
              resolve()
            }else{
              context.errors.add('login', 'is not admin')
              reject(context.errors)
            }
          }, 10)
        })
      })
    })

    var User, valid, invalid
    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        valid = new User({login: 'admin'})
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
        invalid.errors.toJSON().should.have.property('login')
      })
    })


    describe('with validate()', function(){
      it('returns nothing on valid records', function(){
        return valid.validate().should.be.fulfilled()
      })

      it('throws an Error on invalid records', function(){
        return invalid.validate().should.be.rejectedWith(store.ValidationError, { errors: {login: ['is not admin']} })
      })
    })






    describe('base validation', function(){
      var store = new Store()

      store.Model('User', function(){
        this.attribute('login', String)
        this.attribute('email', String)

        this.validates(function(){
          var valid = this.login !== this.email
          if(!valid) this.errors.add('Login and E-Mail are not allowed to be the same value')
          return valid
        })
      })

      var User, valid, invalid
      before(function(){
        return store.ready(function(){
          User = store.Model('User')
          valid = new User({login: 'phil', email: 'philipp@email.com'})
          invalid = new User({login: 'philipp@email.com', email: 'philipp@email.com'})
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
          invalid.errors.toJSON().should.not.have.property('login')
          invalid.errors.toJSON().should.have.property('base')
        })
      })


      describe('with validate()', function(){
        it('returns nothing on valid records', function(){
          return valid.validate().should.be.fulfilled()
        })

        it('throws an ValidationError on invalid records', function(){
          return invalid.validate().should.be.rejectedWith(store.ValidationError, {
            errors: {base: []}
          })
        })
      })
    })
  })
})
