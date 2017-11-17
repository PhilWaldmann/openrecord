var Store = require('../../store/sql')

describe('SQL: Aggregate Functions', function(){
  var store
  var User

  before(function(next){
    store = new Store({
      type: 'sql'
    })

    store.Model('User', function(){
      this.attribute('salary', Number)
    })

    store.ready(function(){
      User = store.Model('User')
      next()
    })
  })



  describe('count()', function(){
    it('has method', function(){
      User.count.should.be.a.Function()
    })

    it('has the right internal variables', function(){
      var Chained = User.count('salary')
      Chained.getInternal('count').should.be.equal('salary')
    })
  })

  describe('sum()', function(){
    it('has method', function(){
      User.sum.should.be.a.Function()
    })

    it('has the right internal variables', function(){
      var Chained = User.sum('salary')
      Chained.getInternal('sum').should.be.equal('salary')
    })
  })

  describe('max()', function(){
    it('has method', function(){
      User.max.should.be.a.Function()
    })

    it('has the right internal variables', function(){
      var Chained = User.max('salary')
      Chained.getInternal('max').should.be.equal('salary')
    })
  })

  describe('min()', function(){
    it('has method', function(){
      User.min.should.be.a.Function()
    })

    it('has the right internal variables', function(){
      var Chained = User.min('salary')
      Chained.getInternal('min').should.be.equal('salary')
    })
  })
})
