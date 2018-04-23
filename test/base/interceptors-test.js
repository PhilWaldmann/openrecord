var should = require('should')

var Store = require('../../store/base')

describe('Interceptors', function() {
  var store = new Store()

  store.Model('User', function() {
    var self = this

    it('has beforeValidation()', function() {
      should.exist(self.beforeValidation)
      self.beforeValidation.should.be.a.Function()
    })
  })

  before(function() {
    return store.ready()
  })

  describe('addInterceptor()', function() {
    var store = new Store()

    before(function() {
      return store.ready()
    })

    it('exists', function() {
      should.exist(store.addInterceptor)
      store.addInterceptor.should.be.a.Function()
    })

    store.addInterceptor('myInterceptor')

    it('exists in the definition scope', function() {
      store.Model('NewModel', function() {
        should.exist(this.myInterceptor)
        this.myInterceptor.should.be.a.Function()
      })
      return store.ready()
    })

    it('throws an error on an undefined interceptor', function() {
      store.Model('NewModel', function() {
        this.addInterceptor('unknownInterceptor', function() {})
      })

      return store
        .ready()
        .should.be.rejectedWith(store.UnknownInterceptorError, {
          message: 'Can not find interceptor "unknownInterceptor"'
        })
    })
  })

  describe('call (without params)', function() {
    var store = new Store()
    var phil

    before(function() {
      return store.ready()
    })

    store.addInterceptor('beforeTest')

    store.Model('User', function() {
      should.not.exist(this.myInterceptor)

      this.beforeTest(function() {
        this.should.be.equal(phil)
      })
    })

    it('has the right scope', function() {
      var User = store.Model('User')
      phil = new User()

      return phil.callInterceptors('beforeTest')
    })
  })

  describe('call (with params)', function() {
    var store = new Store()
    var phil

    before(function() {
      return store.ready()
    })

    store.addInterceptor('beforeTest')

    store.Model('User', function() {
      should.not.exist(this.myInterceptor)

      this.beforeTest(function(arg1, arg2) {
        arg1.should.be.equal('A')
        arg2.should.be.equal('B')
      })
    })

    it('gets the right params', function() {
      var User = store.Model('User')
      phil = new User()

      return phil.callInterceptors('beforeTest', ['A', 'B'])
    })
  })

  describe('call (with params and async)', function() {
    var store = new Store()
    var phil

    before(function() {
      return store.ready()
    })

    store.addInterceptor('beforeTest')

    store.Model('User', function() {
      should.not.exist(this.myInterceptor)

      this.beforeTest(function(arg1) {
        arg1.should.be.equal('A')
        return new Promise(function(resolve) {
          setTimeout(resolve, 100)
        })
      })
    })

    it('gets the right params', function() {
      var User = store.Model('User')
      phil = new User()

      return phil.callInterceptors('beforeTest', ['A'])
    })
  })

  describe('call (with multiple interceptors: false)', function() {
    var store = new Store()
    var phil

    before(function() {
      return store.ready()
    })

    store.addInterceptor('beforeTest')

    store.Model('User', function() {
      this.beforeTest(function(arg1) {
        throw new Error('stop')
      })

      this.beforeTest(function() {})
    })

    it('is false', function() {
      var User = store.Model('User')
      phil = new User()

      return phil
        .callInterceptors('beforeTest', ['A'])
        .should.be.rejectedWith(Error)
    })
  })

  describe('call (with multiple interceptors: true)', function() {
    var store = new Store()
    var phil

    before(function() {
      return store.ready()
    })

    store.addInterceptor('beforeSuccessTest')

    store.Model('User', function() {
      this.beforeSuccessTest(function(arg1) {
        return Promise.resolve()
      })

      this.beforeSuccessTest(function() {})

      this.beforeSuccessTest(function(arg1) {})
    })

    it('is true', function() {
      var User = store.Model('User')
      phil = new User()

      return phil
        .callInterceptors('beforeSuccessTest', ['arg1'])
        .should.be.fulfilled()
    })
  })

  describe('call (without any interceptors)', function() {
    var store = new Store()
    var phil

    before(function() {
      return store.ready()
    })

    store.addInterceptor('beforeTest')

    store.Model('User', function() {})

    it('is true', function() {
      var User = store.Model('User')
      phil = new User()

      return phil.callInterceptors('beforeTest', ['A'])
    })
  })
})
