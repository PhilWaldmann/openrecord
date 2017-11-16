var should = require('should')

var Store = require('../../lib/store')

describe('Scope', function(){
  var store = new Store()

  store.Model('User', function(){
    this.scope('active', function(){
      this.should.have.property('new')
    })
  })

  var User
  before(function(next){
    store.ready(function(){
      User = store.Model('User')
      next()
    })
  })

  describe('scope()', function(){
    it('has defined scope', function(){
      should.exist(User.active)
    })

    it('scope is chainable', function(){
      should.exist(User.active().new)
    })
  })
})


describe('Default Scope', function(){
  var store = new Store()

  store.Model('User', function(){
    this.defaultScope('test')

    this.scope('test', function(){
      this.temporaryDefinition()
      .instanceMethods['test'] = function(){
        return 'test'
      }
    })

    this.scope('admin', function(){

    })
  })

  var User
  before(function(next){
    store.ready(function(){
      User = store.Model('User')
      next()
    })
  })

  describe('scope()', function(){
    it('calls the default scope', function(){
      var a = User.admin().new()
      a.test().should.equal('test')
    })
  })
})
