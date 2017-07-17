
var Store = require('../../lib/store')

describe('Context', function(){
  var store = new Store()

  var myContext = {foo: 'bar'}

  store.Model('User', function(){
    this.attribute('login', String)

    this.hasMany('posts')

    this.beforeValidation(function(){
      // In the record scope (this == record)
      this.context.should.be.eql(myContext)
      this.validate.should.be.a.Function()
    })
  })

  store.Model('Post', function(){
    this.attribute('message', String)

    this.beforeValidation(function(){
      // In the record scope (this == record)
      this.context.should.be.eql(myContext)
    })
  })

  var User
  before(function(next){
    store.ready(function(){
      User = store.Model('User')
      next()
    })
  })

  describe('setContext()', function(){
    it('has method', function(){
      User.setContext.should.be.a.Function()
    })

    it('returns a chained Model', function(){
      var ChainedModel = User.setContext()
      ChainedModel.should.not.be.eql(User)
      ChainedModel.should.be.an.instanceof(Array)
    })

    it('has the right context on record scope', function(next){
      var phil = User.setContext(myContext).new({login: 'phil'})
      phil.isValid(function(){
        next()
      })
    })

    it('has the right context on model scope', function(){
      User.setContext(myContext).context.should.be.equal(myContext)
    })


    it('does not change the context', function(){
      User.setContext(myContext).new({login: 'phil'})
      myContext.should.be.eql({foo: 'bar'})
    })

    it('passes the context to relational objects', function(){
      var user = User.setContext(myContext).new({login: 'phil', posts: [{message: 'test'}]})
      myContext.should.be.eql({foo: 'bar'})

      user.context.should.be.eql(myContext)
      user.posts[0].context.should.be.eql(myContext)
    })
  })
})
