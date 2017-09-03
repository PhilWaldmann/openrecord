// var should = require('should')

describe('Graphql: Query', function(){
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



  it('returns all records', function(done){
    store.ready(function(){
      store.query(`{
        authors{
          name
          email
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            authors: [
              { name: 'phil', email: 'phil@mail.com' },
              { name: 'michl', email: 'michl@mail.com' },
              { name: 'admin', email: 'admin@mail.com' }
            ]
          }
        })
        done()
      })
    })
  })



  it('returns first 2 records', function(done){
    store.ready(function(){
      store.query(`{
        authors(limit: 2){
          name
          email
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            authors: [
              { name: 'phil', email: 'phil@mail.com' },
              { name: 'michl', email: 'michl@mail.com' }
            ]
          }
        })
        done()
      })
    })
  })
})
