var types = ['auto', 'custom']

types.forEach(function(type) {
  describe('GraphQL: Query (' + type + ')', function() {
    var database = 'query' + type
    var query

    before(function(next) {
      beforeGraphQL(database, type, function(error, _query) {
        query = _query
        next(error)
      })
    })

    after(function(next) {
      afterGraphQL(database, next)
    })

    it('returns all records', function() {
      return query(`{
        authors{
          name
          email
        }
      }`).then(function(result) {
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

    it('returns first 2 records', function() {
      return query(`{
        authors(limit: 2){
          name
          email
        }
      }`).then(function(result) {
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

    it('returns a custom connection type with totalCount and nodes', function() {
      return query(`{
        recipes(limit: 2){
          nodes{
            id
            title
          }
          totalCount
        }
      }`).then(function(result) {
        result.should.be.eql({
          data: {
            recipes: {
              nodes: [
                { id: 1, title: 'Toast Hawaii' },
                { id: 2, title: 'scrambled eggs' }
              ],
              totalCount: 4
            }
          }
        })
      })
    })

    it('returns a single record', function() {
      return query(`{
        author(id: 1){
          name
          email
        }
      }`).then(function(result) {
        result.should.be.eql({
          data: {
            author: { name: 'phil', email: 'phil@mail.com' }
          }
        })
      })
    })

    it('returns an error on missing id', function() {
      return query(`{
        author{
          name
          email
        }
      }`).then(function(result) {
        result.should.be.eql({
          errors: [
            {
              message:
                'Field "author" argument "id" of type "Int!" is required but not provided.',
              locations: [{ line: 2, column: 9 }],
              path: undefined
            }
          ]
        })
      })
    })

    it('returns a single record with related data', function() {
      return query(`{
        author(id: 1){
          name
          email
          recipes{
            id
            title
            rating
          }
        }
      }`).then(function(result) {
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

    it('returns a single record with custom related data', function() {
      return query(`{
        author(id: 1){
          name
          email
          topRatedRecipes{
            id
            title
            rating
          }
        }
      }`).then(function(result) {
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
