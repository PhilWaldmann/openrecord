var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Converter', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('User', function(){
        this.convertRead('my_blob', function(value){
          return value.toUpperCase()
        })

        this.convertWrite('my_integer', function(value){
          return value * 100
        })

        this.convertOutput('my_real', function(value){
          return value > 10.0 ? 'BIG' : 'SMALL'
        }, false)
      })
    })



    it('convertRead() converts the value', function(done){
      store.ready(function(){
        var User = store.Model('User')

        User.find(1).exec(function(user){
          user.my_blob.should.be.equal('PHIL')
          done()
        })
      })
    })


    it('convertWrite() converts the value', function(done){
      store.ready(function(){
        var User = store.Model('User')

        User.create({
          my_integer: 2
        }).then(function(){
          User.find(2).exec(function(user){
            user.my_integer.should.be.equal(200)
            done()
          })
        })
      })
    })


    it('convertOutput() converts the value and overwrites the original type', function(done){
      store.ready(function(){
        var User = store.Model('User')

        User.find(1).exec(function(user){
          user.my_real.should.be.equal('BIG')
          done()
        })
      })
    })

    it('convertOutput() does not change the original value', function(done){
      store.ready(function(){
        var User = store.Model('User')

        User.find(1).exec(function(user){
          user.attributes.my_real.should.be.equal(44.66)
          done()
        })
      })
    })
  })
}
