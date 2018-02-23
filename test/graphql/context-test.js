// var should = require('should')

var types = ['auto', 'custom']

types.forEach(function(type){
  describe('GraphQL: Context (' + type + ')', function(){
    var database = 'context' + type
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



    it('get `me` via context', function(){
      return query(`{
        me{
          name
          email
        }
      }`, {id: 1})
      .then(function(result){
        result.should.be.eql({
          data: {
            me: { name: 'phil', email: 'phil@mail.com' }
          }
        })
      })
    })

    it('get `me` via context and return additonal relations', function(){
      return query(`{
        me{
          name
          email
          recipes{
            title
          }
        }
      }`, {id: 1})
      .then(function(result){
        result.should.be.eql({
          data: {
            me: {
              name: 'phil',
              email: 'phil@mail.com',
              recipes: [
                { title: 'Toast Hawaii' },
                { title: 'scrambled eggs' },
                { title: 'Steak' }
              ]
            }
          }
        })
      })
    })
  })
})
