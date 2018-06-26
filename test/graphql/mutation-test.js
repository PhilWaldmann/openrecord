// var should = require('should')
var types = ['auto', 'custom']

types.forEach(function(type) {
  describe('GraphQL: Mutation (' + type + ')', function() {
    var database = 'mutation' + type
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

    it('executes a mutation and returns the id', function() {
      return query(
        `
        mutation Test{
          createRecipe(input: {title: "Mutation Test", description: "Foobar", author_id: 1}) {
            id
          }
        }
      `,
        { id: 1 }
      ).then(function(result) {
        result.should.be.eql({
          data: {
            createRecipe: {
              id: 5
            }
          }
        })
      })
    })

    it('executes a mutation and returns the whole record + relational data', function() {
      return query(
        `
        mutation Test{
          createRecipe(input: {title: "Mutation Test2", description: "Foobar", author_id: 1}) {
            id
            title
            author_id
            author{
              name
            }
          }
        }
      `,
        { id: 1 }
      ).then(function(result) {
        result.should.be.eql({
          data: {
            createRecipe: {
              id: 6,
              title: 'Mutation Test2',
              author_id: 1,
              author: {
                name: 'phil'
              }
            }
          }
        })
      })
    })

    it('executes a mutation with custom handler', function() {
      return query(
        `
        mutation Test{
          updateRecipe(id:5, input: {title: "Updated"}) {
            id
            title
            author_id
            author{
              name
            }
          }
        }
      `,
        { id: 1 }
      ).then(function(result) {
        result.should.be.eql({
          data: {
            updateRecipe: {
              id: 5,
              title: 'Updated',
              author_id: 1,
              author: {
                name: 'phil'
              }
            }
          }
        })
      })
    })

    it('executes a mutation with custom return type', function() {
      return query(
        `
        mutation Test{
          destroyRecipe(id: 5)
        }
      `,
        { id: 1 }
      ).then(function(result) {
        result.should.be.eql({
          data: {
            destroyRecipe: true
          }
        })
      })
    })

    it('executes a mutation and returns nested related data', function() {
      return query(
        `
        mutation Test{
          createAuthor(input: {name: "Max", email: "max@openrecord.com"}) {
            id
            name
            email
            active
            recipes{
              nodes{
                id
                title
                author{
                  id
                }
              }
            }
          }
        }
      `,
        { id: 1 }
      ).then(function(result) {
        result.should.be.eql({
          data: {
            createAuthor: {
              id: 4,
              name: 'Max',
              email: 'max@openrecord.com',
              active: true,
              recipes: {
                nodes: [
                  {
                    id: 7,
                    title: 'Example recipe',
                    author: {
                      id: 4
                    }
                  }
                ]
              }
            }
          }
        })
      })
    })
  })
})
