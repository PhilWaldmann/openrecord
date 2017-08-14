// var should = require('should')

describe('Graphql: Attributes', function(){
  var database = 'attributes'
  var query


  before(function(next){
    beforeGraphQL(database, function(q){
      query = q
      next()
    })
  })

  after(function(){
    afterGraphQL(database)
  })


  it('returns a single record', function(done){
    query(`{
      user(id: 1){
        login
      }
    }`).then(result => {
      result.should.be.eql({ data: { user: { login: 'phil' } } })
      done()
    })
  })
})
