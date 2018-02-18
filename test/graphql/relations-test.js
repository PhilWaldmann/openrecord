// var should = require('should')

describe('GraphQL: Relations', function(){
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




  it('returns a record with relational data', function(){
    return store.ready(function(){
      return store.query(`{
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
  })


  it('returns a record with deeply nested relational data', function(){
    return store.ready(function(){
      return store.query(`{
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
  })



  it('returns a record with deeply nested relational data (cross store)', function(){
    return store.ready(function(){
      return store.query(`{
          recipe(id: 2){
            title,
            ingredients{
              name
              food{
                energy
              }
            }
          }
        }`)
      .then(function(result){
        result.should.be.eql({
          data: {
            recipe: {
              title: 'scrambled eggs',
              ingredients: [
                { name: 'eggs', food: { energy: 80 } },
                { name: 'salt', food: { energy: 0 } },
                { name: 'pepper', food: { energy: 1 } },
                { name: 'butter', food: { energy: 200 } }
              ]
            }
          }
        })
      })
    })
  })
})
