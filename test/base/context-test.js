
var Store = require('../../store/base')

describe('Context', function(){
  var store = new Store()

  var myContext = {foo: 'bar'}

  store.Model('User', function(){
    this.attribute('id', Number, {primary: true})
    this.attribute('login', String)

    this.hasMany('posts')

    this.beforeValidation(function(){
      // In the record scope (this == record)
      this.context.should.be.eql(myContext)
      this.validate.should.be.a.Function()
    })
  })

  store.Model('Post', function(){
    this.attribute('id', Number, {primary: true})
    this.attribute('user_id', Number)
    this.attribute('message', String)

    this.hasMany('comments')

    this.beforeValidation(function(){
      // In the record scope (this == record)
      this.context.should.be.eql(myContext)
    })
  })

  store.Model('Comment', function(){
    this.attribute('id', Number, {primary: true})
    this.attribute('post_id', Number)
    this.attribute('words', String)

    this.hasMany('super_nesteds')

    this.beforeValidation(function(){
      // In the record scope (this == record)
      this.context.should.be.eql(myContext)
    })
  })

  store.Model('SuperNested', function(){
    this.attribute('id', Number, {primary: true})
    this.attribute('comment_id', Number)
    this.attribute('words', String)

    this.beforeValidation(function(){
      // In the record scope (this == record)
      this.context.should.be.eql(myContext)
    })
  })

  var User
  before(function(){
    return store.ready(function(){
      User = store.Model('User')
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

    it('has the right context on record scope', function(){
      var phil = User.setContext(myContext).new({login: 'phil'})
      return phil.isValid()
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
      user._posts[0].context.should.be.eql(myContext)
    })

    it('passes the context to nested relational objects', function(){
      var user = User.setContext(myContext).new({
        login: 'phil',
        posts: [
          {
            message: 'test',
            comments: [
              {
                words: 'words and stuff',
                super_nesteds: [
                  {words: 'nested words'}
                ]
              }
            ]
          }
        ]
      })
      myContext.should.be.eql({foo: 'bar'})

      user.context.should.be.eql(myContext)
      user.posts[0].context.should.be.eql(myContext)
      user.posts[0].comments[0].context.should.be.eql(myContext)
      user.posts[0].comments[0].super_nesteds[0].context.should.be.eql(myContext)
    })

    it('passes the context to newly built nested relational objects', function(){
      var user = User.setContext(myContext).new({
        login: 'phil',
        posts: [
          {
            message: 'test',
            comments: [
              {
                words: 'words and stuff'
              }
            ]
          }
        ]
      })      
      var newlyNested = user._posts[0]._comments[0].super_nesteds.new({words: 'nested words'})

      myContext.should.be.eql({foo: 'bar'})

      newlyNested.context.should.be.eql(myContext)
    })
  })
})
