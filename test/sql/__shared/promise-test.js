var should = require('should')

var Store = require('../../../lib/store')

module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Promise', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('User', function(){})
      store.Model('Post', function(){
        this.validatesPresenceOf('message')
      })
    })




    it('has then() function', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find(1).exec().then.should.be.a.Function()
        next()
      })
    })


    it('returns select results', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find(1).exec().then(function(result){
          result.should.be.instanceof(User)
          next()
        })
      })
    })


    it('returns select results multiple times', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find(1).exec(function(result){
          result.should.be.instanceof(User)
          return result
        }).then(function(result){
          result.should.be.instanceof(User)
          next()
        })
      })
    })


    it('saves a record', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find(1).exec(function(result){
          result.login = 'test'
          result.save().then(function(){
            next()
          })
        })
      })
    })

    it('destroys a record', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find(2).exec(function(result){
          result.destroy().then(function(success){
            success.should.be.equal(true)
            next()
          })
        })
      })
    })

    it('destroys multiple records', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.find(1, 2).destroyAll(function(success){
          success.should.be.equal(true)
          next()
        })
      })
    })

    it('destroys multiple records', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.find(3, 4).deleteAll(function(success){
          success.should.be.equal(true)
          next()
        })
      })
    })

    it('destroys multiple records', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where({id_gt: 2}).destroy().then(function(result){
          next()
        })
      })
    })

    it('calls onReject method on error', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where('foo=blaa').exec(function(result){

        }, function(error){
          should.exist(error)
          next()
        })
      })
    })


    it('calls onReject methods on error', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where('foo=blaa').exec(function(result){

        }, function(error){
          should.exist(error)
        }).then(null, function(error){
          error.should.be.instanceOf(Store.SQLError)
          next()
        })
      })
    })


    it('calls catch method on error', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where('foo=blaa').exec().catch(function(error){
          error.should.be.instanceOf(Store.SQLError)
          next()
        })
      })
    })


    it('calls catch with exec() first', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where('foo=blaa').exec(function(result){

        }).catch(function(error){
          should.exist(error)
          next()
        })
      })
    })


    it('catches only SQLError', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where('foo=blaa').catch(Store.RecordNotFoundError, function(error){
          error.should.be.instanceOf(Store.RecordNotFoundError)
        }).catch(Store.SQLError, function(error){
          error.should.be.instanceOf(Store.SQLError)
          next()
        })
      })
    })

    it('catches only Store.SQLError', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where('foo=blaa').catch(Store.RecordNotFoundError, function(error){
          error.should.be.instanceOf(Store.RecordNotFoundError)
        }).catch(Store.SQLError, function(error){
          error.should.be.instanceOf(Store.SQLError)
          next()
        })
      })
    })


    it('create multiple records', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.create({message: 'first promise'}).then(function(){
          return Post.create({message: 'second promise'})
        }).then(function(){
          return Post.create({message: 'third promise'})
        }).then(function(){
          return Post.where({message_like: 'promise'}).exec()
        }).then(function(posts){
          posts.length.should.be.equal(3)
          next()
        })
      })
    })


    it('create multiple records with an validation error', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.create({message: 'first pro_mise'}).then(function(){
          return Post.create({message: 'second pro_mise'})
        }).then(function(){
          return Post.create({})
        }).then(function(){
          return Post.where({message_like: 'pro_mise'}).exec()
        }).then(function(posts){
          posts.length.should.be.equal(2)
          next()
        })
      })
    })


    it('create multiple records with all()', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.all([
          Post.create({message: 'first element'}),
          Post.create({message: 'second element'}),
          Post.create({message: 'third element'})
        ]).then(function(results){
          results[0].should.be.equal(true)
          results[1].should.be.equal(true)
          results[2].should.be.equal(true)
          return Post.where({message_like: 'element'}).exec()
        }).then(function(posts){
          posts.length.should.be.equal(3)
          next()
        })
      })
    })
  })
}
