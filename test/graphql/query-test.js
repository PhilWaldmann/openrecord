
describe('GraphQL: Query', function(){
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



  it('returns all records', function(){
    return store.ready(function(){
      return store.query(`{
        authors{
          name
          email
        }
      }`)
      .then(function(result){
        result.should.be.eql({
          data: {
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



  it('returns first 2 records', function(){
    return store.ready(function(){
      return store.query(`{
        authors(limit: 2){
          name
          email
        }
      }`)
      .then(function(result){
        result.should.be.eql({
          data: {
            authors: [
              { name: 'phil', email: 'phil@mail.com' },
              { name: 'michl', email: 'michl@mail.com' }
            ]
          }
        })
      })
    })
  })


  it('returns a single record', function(){
    return store.ready(function(){
      return store.query(`{
        author(id: 1){
          name
          email
        }
      }`)
      .then(function(result){
        result.should.be.eql({
          data: {
            author: { name: 'phil', email: 'phil@mail.com' }
          }
        })
      })
    })
  })

  it('returns an error on missing id', function(){
    return store.ready(function(){
      return store.query(`{
        author{
          name
          email
        }
      }`)
      .then(function(result){
        result.should.be.eql({
          errors: [{
            message: 'Field "author" argument "id" of type "Int!" is required but not provided.',
            locations: [{ line: 2, column: 9 }],
            path: undefined
          }]
        })
      })
    })
  })



  it('returns a single record with related data', function(){
    return store.ready(function(){
      return store.query(`{
        author(id: 1){
          name
          email
          recipes{
            id
            title
            rating
          }
        }
      }`)
      .then(function(result){
        result.should.be.eql({
          data: {
            author: {
              name: 'phil',
              email: 'phil@mail.com',
              recipes: [
                { id: 1, title: 'Toast Hawaii', rating: 4 },
                { id: 2, title: 'scrambled eggs', rating: 3 },
                { id: 3, title: 'Steak', rating: 5 }
              ]
            }
          }
        })
      })
    })
  })


  it('returns a single record with custom related data', function(){
    return store.ready(function(){
      return store.query(`{
        author(id: 1){
          name
          email
          topRatedRecipes{
            id
            title
            rating
          }
        }
      }`)
      .then(function(result){
        result.should.be.eql({
          data: {
            author: {
              name: 'phil',
              email: 'phil@mail.com',
              topRatedRecipes: [
                { id: 3, title: 'Steak', rating: 5 },
                { id: 1, title: 'Toast Hawaii', rating: 4 },
                { id: 2, title: 'scrambled eggs', rating: 3 }
              ]
            }
          }
        })
      })
    })
  })
})
