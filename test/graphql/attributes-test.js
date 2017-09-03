// var should = require('should')

describe('Graphql: Attributes', function(){
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


  it('returns a single attribute', function(done){
    store.query(`{
      author(id: 1){
        name
      }
    }`).then(result => {
      result.should.be.eql({ data: { author: { name: 'phil' } } })
      done()
    })
  })


  it('returns a multiple attributes', function(done){
    store.query(`{
      author(id: 1){
        name
        email
      }
    }`).then(result => {
      result.should.be.eql({ data: { author: { name: 'phil', email: 'phil@mail.com' } } })
      done()
    })
  })


  it('returns a single value (count)', function(done){
    store.ready(function(){
      store.query(`{
        author_count
      }`).then(result => {
        result.should.be.eql({ data: { author_count: 3 } })
        done()
      })
    })
  })


  it('returns multiple records and the total count', function(done){
    store.ready(function(){
      store.query(`{
        author_count
        authors{
          name
          email
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            author_count: 3,
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


  it('returns data via getter method', function(done){
    store.query(`{
      author(id: 1){
        name,
        info
      }
    }`).then(result => {
      result.should.be.eql({ data: { author: {
        name: 'phil',
        info: 'phil <phil@mail.com>'
      } } })
      done()
    })
  })

  it('returns data via method', function(done){
    store.query(`{
      ingredient(id: 8){
        name,
        total_amount
      }
    }`).then(result => {
      result.should.be.eql({ data: { ingredient: {
        name: 'butter',
        total_amount: 21
      } } })
      done()
    })
  })
})
