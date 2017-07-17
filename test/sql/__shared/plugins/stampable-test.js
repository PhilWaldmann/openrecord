var should = require('should')
var Store = require('../../../../lib/store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Stampable', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.getUserBy(function(){
        return 2 // pseudo user id
      })

      store.Model('User', function(){
        this.stampable()
      })

      store.Model('Post', function(){
        this.stampable()
      })
    })

    it('set created_at on create', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.create({}, function(success){
          success.should.be.equal(true)
          should.exist(this.created_at)
          next()
        })
      })
    })

    it('set updated_at on create', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.create({}, function(success){
          success.should.be.equal(true)
          should.exist(this.updated_at)
          next()
        })
      })
    })

    it('set updated_at on update', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.find(1, function(post){
          post.message = 'foo'
          post.save(function(){
            should.exist(this.updated_at)
            next()
          })
        })
      })
    })

    it('does not set updated_at on unnecesary update', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.find(2, function(post){
          post.save(function(){
            should.not.exist(this.updated_at)
            next()
          })
        })
      })
    })


    it('set creator_id on create', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.create({}, function(success){
          success.should.be.equal(true)
          this.creator_id.should.be.equal(2)
          next()
        })
      })
    })

    it('set updater_id on create', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.create({}, function(success){
          success.should.be.equal(true)
          this.updater_id.should.be.equal(2)
          next()
        })
      })
    })

    it('set updater_id on update', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.find(3, function(post){
          post.message = 'foo2'
          post.save(function(){
            this.updater_id.should.be.equal(2)
            next()
          })
        })
      })
    })

    it('does not set updater_id on unnecesary update', function(next){
      store.ready(function(){
        var Post = store.Model('Post')
        Post.find(4, function(post){
          post.save(function(){
            should.not.exist(this.updater_id)
            next()
          })
        })
      })
    })
  })
}
