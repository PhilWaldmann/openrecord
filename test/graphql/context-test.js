// var should = require('should')

describe('Graphql: Context', function(){
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



  it('get `me` via context', function(done){
    store.ready(function(){
      store.query(`{
        me{
          name
          email
        }
      }`, {id: 1}).then(result => {
        result.should.be.eql({
          data: {
            me: { name: 'phil', email: 'phil@mail.com' }
          }
        })
        done()
      })
    })
  })

  it('get `me` via context and return additonal relations', function(done){
    store.ready(function(){
      store.query(`{
        me{
          name
          email
          recipes{
            title
          }
        }
      }`, {id: 1}).then(result => {
        result.should.be.eql({
          data: {
            me: { name: 'phil',
              email: 'phil@mail.com',
              recipes: [
                { title: 'Toast Hawaii' },
                { title: 'scrambled eggs' },
                { title: 'Steak' }
              ]
            }
          }
        })
        done()
      })
    })
  })
})
