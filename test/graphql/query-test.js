
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


  it('returns a single record', function(done){
    store.ready(function(){
      store.query(`{
        author(id: 1){
          name
          email
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            author: { name: 'phil', email: 'phil@mail.com' }
          }
        })
        done()
      })
    })
  })

  it('returns an error on missing id', function(done){
    store.ready(function(){
      store.query(`{
        author{
          name
          email
        }
      }`).then(result => {
        result.should.be.eql({
          errors: [{
            message: 'Field "author" argument "id" of type "Int!" is required but not provided.',
            locations: [{ line: 2, column: 9 }],
            path: undefined
          }]
        })
        done()
      })
    })
  })



  it('returns a single record with related data', function(done){
    store.ready(function(){
      store.query(`{
        author(id: 1){
          name
          email
          recipes{
            id
            title
            rating
          }
        }
      }`).then(result => {
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
        done()
      })
    })
  })


  it('returns a single record with custom related data', function(done){
    store.ready(function(){
      store.query(`{
        author(id: 1){
          name
          email
          topRatedRecipes{
            id
            title
            rating
          }
        }
      }`).then(result => {
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
        done()
      })
    })
  })
})
