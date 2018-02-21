// var should = require('should')

describe('GraphQL: Relations', function(){
  var database = 'relations'
  var query


  before(function(next){
    beforeGraphQL(database, function(error, _query){
      query = _query
      next(error)
    })
  })

  after(function(next){
    afterGraphQL(database, next)
  })




  it('returns a record with relational data', function(){
    return query(`{
        authors{
          name
          recipes{
            id
            title
          }
        }
      }`)
    .then(function(result){
      result.should.be.eql({
        data: {
          authors: [
            {
              name: 'phil',
              recipes: [
                { id: 1, title: 'Toast Hawaii' },
                { id: 2, title: 'scrambled eggs' },
                { id: 3, title: 'Steak' }
              ]
            },
            {
              name: 'michl',
              recipes: [
                { id: 4, title: 'Spinach Enchiladas' }
              ]
            },
            {
              name: 'admin',
              recipes: []
            }
          ]
        }
      })
    })
  })


  it('returns a record with deeply nested relational data', function(){
    return query(`{
        authors{
          name
          recipes{
            id
            title
            ingredients{
              name
            }
          }
        }
      }`)
    .then(function(result){
      result.should.be.eql({
        data: {
          authors: [
            {
              name: 'phil',
              recipes: [
                { id: 1,
                  title: 'Toast Hawaii',
                  ingredients: [
                    { name: 'toast' },
                    { name: 'pinapple' },
                    { name: 'cheese' },
                    { name: 'butter' }
                  ] },
                { id: 2,
                  title: 'scrambled eggs',
                  ingredients: [
                    { name: 'eggs' },
                    { name: 'salt' },
                    { name: 'pepper' },
                    { name: 'butter' }
                  ] },
                { id: 3, title: 'Steak', ingredients: [ { name: 'ribeye steak' } ] }
              ]
            },
            {
              name: 'michl',
              recipes: [
                { id: 4,
                  title: 'Spinach Enchiladas',
                  ingredients: [
                    { name: 'butter' },
                    { name: 'onions' },
                    { name: 'garlic' },
                    { name: 'spinach' },
                    { name: 'ricotta cheese' },
                    { name: 'sour creme' },
                    { name: 'corn tortillas' },
                    { name: 'enchilada sauce' }
                  ] }
              ]
            },
            {
              name: 'admin',
              recipes: []
            }
          ]
        }
      })
    })
  })



  it('returns a record with deeply nested relational data (cross store)', function(){
    return query(`{
        recipe(id: 1){
          title,
          ingredients{
            name
            food{
              energy
              alternatives{
                name
              }
            }
          }
        }
      }`)
    .then(function(result){
      // true.should.be.equal(false)
      result.should.be.eql({
        data: {
          recipe: {
            title: 'Toast Hawaii',
            ingredients: [
              {
                name: 'toast',
                food: { energy: 120, alternatives: [ { name: 'whole wheat toast' } ] }
              },
              { name: 'pinapple', food: { energy: 80, alternatives: [] } },
              { name: 'cheese', food: { energy: 150, alternatives: [] } },
              { name: 'butter', food: { energy: 200, alternatives: [] } }
            ]
          }
        }
      })
    })
  })
})
