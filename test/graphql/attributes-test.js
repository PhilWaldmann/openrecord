var should = require('should')

should.config.checkProtoEql = false


describe('GraphQL: Attributes', function(){
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


  it('returns a single attribute', function(){
    return store.query(`{
      author(id: 1){
        name
      }
    }`)
    .then(function(result){
      result.should.be.eql({ data: { author: { name: 'phil' } } })
    })
  })


  it('returns a multiple attributes', function(){
    return store.query(`{
      author(id: 1){
        name
        email
      }
    }`)
    .then(function(result){
      result.should.be.eql({ data: { author: { name: 'phil', email: 'phil@mail.com' } } })
    })
  })


  it('returns a single value (count)', function(){
    return store.ready(function(){
      return store.query(`{
        author_count
      }`)
      .then(function(result){
        result.should.be.eql({ data: { author_count: 3 } })
      })
    })
  })


  it('returns multiple records and the total count', function(){
    return store.ready(function(){
      return store.query(`{
        author_count
        authors{
          name
          email
        }
      }`)
      .then(function(result){
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
      })
    })
  })


  it('returns data via getter method', function(){
    return store.query(`{
      author(id: 1){
        name,
        info
      }
    }`)
    .then(function(result){
      result.should.be.eql({ data: { author: {
        name: 'phil',
        info: 'phil <phil@mail.com>'
      } } })
    })
  })

  it('returns data via method', function(){
    return store.query(`{
      ingredient(id: 8){
        name,
        total_amount
      }
    }`)
    .then(function(result){
      result.should.be.eql({ data: { ingredient: {
        name: 'butter',
        total_amount: 21
      } } })
    })
  })
})
