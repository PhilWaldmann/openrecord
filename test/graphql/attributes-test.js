var should = require('should')
var types = ['auto', 'custom']

should.config.checkProtoEql = false

types.forEach(function(type){
  describe('GraphQL: Attributes (' + type + ')', function(){
    var database = 'attributes' + type
    var query


    before(function(next){
      beforeGraphQL(database, type, function(error, _query){
        query = _query
        next(error)
      })
    })

    after(function(next){
      afterGraphQL(database, next)
    })


    it('returns a single attribute', function(){
      return query(`{
        author(id: 1){
          name
        }
      }`)
      .then(function(result){
        result.should.be.eql({ data: { author: { name: 'phil' } } })
      })
    })


    it('returns a multiple attributes', function(){
      return query(`{
        author(id: 1){
          name
          email
        }
      }`)
      .then(function(result){
        result.should.be.eql({ data: { author: { name: 'phil', email: 'phil@mail.com' } } })
      })
    })


    it('returns a single attribute with a variant', function(){
      return query(`{
        author(id: 1){
          name(upper: true)
        }
      }`)
      .then(function(result){
        result.should.be.eql({ data: { author: { name: 'PHIL' } } })
      })
    })


    it('returns a single value (count)', function(){
      return query(`{
        author_count
      }`)
      .then(function(result){        
        result.should.be.eql({ data: { author_count: 3 } })
      })
    })


    it('returns multiple records and the total count', function(){
      return query(`{
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


    it('returns data via getter method', function(){
      return query(`{
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
      return query(`{
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
})
