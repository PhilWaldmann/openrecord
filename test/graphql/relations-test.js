// var should = require('should')
var types = ['auto', 'custom']

types.forEach(function(type) {
  describe('GraphQL: Relations (' + type + ')', function() {
    var database = 'relations' + type
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

    it('returns a record with relational data', function() {
      return query(`{
          authors{
            name
            recipes{
              totalCount
            }
          }
        }`).then(function(result) {
        result.should.be.eql({
          data: {
            authors: [
              {
                name: 'phil',
                recipes: {
                  totalCount: 3
                }
              },
              {
                name: 'michl',
                recipes: {
                  totalCount: 1
                }
              },
              {
                name: 'admin',
                recipes: {
                  totalCount: 0
                }
              }
            ]
          }
        })
      })
    })

    it('returns a record with deeply nested relational data', function() {
      return query(`{
          authors{
            name
            recipes{
              nodes{
                id
                title
                ingredients{
                  nodes{
                    name
                  }
                  totalCount
                }
              }
            }
          }
        }`).then(function(result) {
        result.should.be.eql({
          data: {
            authors: [
              {
                name: 'phil',
                recipes: {
                  nodes: [
                    {
                      id: 1,
                      title: 'Toast Hawaii',
                      ingredients: {
                        nodes: [
                          { name: 'toast' },
                          { name: 'pinapple' },
                          { name: 'cheese' },
                          { name: 'butter' }
                        ],
                        totalCount: 4
                      }
                    },
                    {
                      id: 2,
                      title: 'scrambled eggs',
                      ingredients: {
                        nodes: [
                          { name: 'eggs' },
                          { name: 'salt' },
                          { name: 'pepper' },
                          { name: 'butter' }
                        ],
                        totalCount: 4
                      }
                    },
                    {
                      id: 3,
                      title: 'Steak',
                      ingredients: {
                        nodes: [{ name: 'ribeye steak' }],
                        totalCount: 1
                      }
                    }
                  ]
                }
              },
              {
                name: 'michl',
                recipes: {
                  nodes: [
                    {
                      id: 4,
                      title: 'Spinach Enchiladas',
                      ingredients: {
                        nodes: [
                          { name: 'butter' },
                          { name: 'onions' },
                          { name: 'garlic' },
                          { name: 'spinach' },
                          { name: 'ricotta cheese' },
                          { name: 'sour creme' },
                          { name: 'corn tortillas' },
                          { name: 'enchilada sauce' }
                        ],
                        totalCount: 8
                      }
                    }
                  ]
                }
              },
              {
                name: 'admin',
                recipes: {
                  nodes: []
                }
              }
            ]
          }
        })
      })
    })

    it('returns a record with deeply nested relational data (cross store)', function() {
      return query(`{
          recipe(id: 1){
            title,
            ingredients{
              nodes{
                name
                food{
                  energy
                  alternatives{
                    name
                  }
                }
              }
            }
          }
        }`).then(function(result) {
        result.should.be.eql({
          data: {
            recipe: {
              title: 'Toast Hawaii',
              ingredients: {
                nodes: [
                  {
                    name: 'toast',
                    food: {
                      energy: 120,
                      alternatives: [{ name: 'whole wheat toast' }]
                    }
                  },
                  { name: 'pinapple', food: { energy: 80, alternatives: [] } },
                  { name: 'cheese', food: { energy: 150, alternatives: [] } },
                  { name: 'butter', food: { energy: 200, alternatives: [] } }
                ]
              }
            }
          }
        })
      })
    })

    it('returns a record with deeply nested relational via scope', function() {
      return query(`{
          recipe(id: 1){
            title,
            ingredients(limit: 2){
              nodes{
                name
              }
            }
          }
        }`).then(function(result) {
        result.should.be.eql({
          data: {
            recipe: {
              title: 'Toast Hawaii',
              ingredients: {
                nodes: [{ name: 'toast' }, { name: 'pinapple' }]
              }
            }
          }
        })
      })
    })
  })
})
