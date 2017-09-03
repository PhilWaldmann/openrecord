// var should = require('should')

describe('Graphql: Base', function(){
  var database = 'attributes'
  var store


  before(function(next){
    beforeGraphQL(database, function(_store){
      store = _store
      next()
    })
  })

  after(function(){
    afterGraphQL(database)
  })



  it('store has a query function', function(){
    store.query.should.be.a.Function()
  })
})
