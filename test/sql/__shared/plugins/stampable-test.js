var should = require('should')
var Store = require('../../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Stampable', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      

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

    it('set created_at on create', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.create({})
        .then(function(result){
          should.exist(result.created_at)
        })
      })
    })

    it('set updated_at on create', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.create({})
      })
      .then(function(result){
        should.exist(result.updated_at)
      })
    })

    it('set updated_at on update', function(){
      return store.ready(function(){
        var Post = store.Model('Post')
        return Post.find(1)
        .then(function(post){
          post.message = 'foo'
          return post.save()
        })
        .then(function(result){
          should.exist(result.updated_at)
        })
      })
    })

    it('does not set updated_at on unnecesary update', function(){
      return store.ready(function(){
        var Post = store.Model('Post')
        return Post.find(2)
        .then(function(post){
          return post.save()
        })
        .then(function(result){
          should.not.exist(result.updated_at)
        })
      })
    })


    it('set creator_id on create', function(){
      return store.ready(function(){
        var Post = store.Model('Post')
        return Post.create({})
        .then(function(result){
          result.creator_id.should.be.equal(2)
        })
      })
    })

    it('set updater_id on create', function(){
      return store.ready(function(){
        var Post = store.Model('Post')
        return Post.create({})
        .then(function(result){
          result.updater_id.should.be.equal(2)
        })
      })
    })

    it('set updater_id on update', function(){
      return store.ready(function(){
        var Post = store.Model('Post')
        return Post.find(3)
        .then(function(post){
          post.message = 'foo2'
          return post.save()
        })
        .then(function(result){
          result.updater_id.should.be.equal(2)
        })
      })
    })

    it('does not set updater_id on unnecesary update', function(){
      return store.ready(function(){
        var Post = store.Model('Post')
        return Post.find(4)
        .then(function(post){
          return post.save()
        })
        .then(function(result){
          should.not.exist(result.updater_id)
        })
      })
    })
  })
}
