var should = require('should')
var Store = require('../../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Paranoid', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('User', function(){
        this.paranoid()
      })
    })

    it('returns only records with deleted_at IS NULL', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where({login_not: 'hans'}).exec(function(records){
          records.length.should.be.equal(2)
          next()
        })
      })
    })


    it('returns all records with with_deleted() scope', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where({login_not: 'hans'}).with_deleted().exec(function(records){
          records.length.should.be.equal(4)
          next()
        })
      })
    })


    it('"deletes" a record', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find(5).exec(function(hans){
          hans.destroy(function(success){
            success.should.be.equal(true)
            User.find(5).exec(function(delHans){
              should.not.exist(delHans)

              User.find(5).with_deleted().exec(function(existingHans){
                existingHans.login.should.be.equal('hans')
                should.exist(existingHans.deleted_at)
                next()
              })
            })
          })
        })
      })
    })
  })
}
