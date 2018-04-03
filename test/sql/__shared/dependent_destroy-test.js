var should = require('should')
var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Destroy dependent', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      store.Model('User', function(){
        this.hasMany('posts')
        this.hasMany('threads')
        this.hasMany('poly_things', {as: 'member', dependent: 'destroy'})
        this.beforeDestroy(function(){
          if(this.id === 2) throw new Error('stop from user')
        })
      })
      store.Model('Post', function(){
        this.belongsTo('user', {dependent: 'destroy'})
        this.belongsTo('thread', {dependent: 'destroy'})
        this.hasMany('poly_things', {as: 'member', dependent: 'destroy'})
        this.beforeDestroy(function(){
          if(this.id === 1) throw new Error('stop from post')
        })
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts', {dependent: 'destroy'})
        this.hasMany('poly_things', {as: 'member', dependent: 'destroy'})
      })
      store.Model('PolyThing', function(){
        this.belongsToPolymorphic('member')
      })
    })


    it('destroy hasMany', function(){
      return store.ready(function(){
        var User = store.Model('User')

        return User.find(1)
        .then(function(user){
          return user.destroy()
        })
      })
    })

    it('destroy hasMany with failing relation destroy', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')

        return Thread.find(1)
        .then(function(thread){
          return thread.destroy()
        })
      }).should.be.rejectedWith(Error, {message: 'stop from post'})
    })


    it('destroy hasMany with failing nested relation destroy', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')

        return Thread.find(3)
        .then(function(thread){
          return thread.destroy()
        })
      }).should.be.rejectedWith(Error, {message: 'stop from user'})
    })


    it('destroy belongsTo', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        var Post = store.Model('Post')

        return Post.find(3)
        .then(function(post){
          return post.destroy()
          .then(function(){
            return Thread.find(2)
            .then(function(thread){
              should.not.exist(thread)
            })
          })
        })
      })
    })


    it('destroy belongsTo with failing relation destroy', function(){
      return store.ready(function(){
        var Post = store.Model('Post')

        return Post.find(5)
        .then(function(post){
          return post.destroy()
        })
      }).should.be.rejectedWith(Error, {message: 'stop from user'})
    })



    it('destroy polymorph hasMany', function(){
      return store.ready(function(){
        var PolyThing = store.Model('PolyThing')
        var Post = store.Model('Post')

        return Post.find(6)
        .then(function(post){
          return post.destroy()
        }).then(function(){
          return PolyThing.find([1, 2])
        }).then(function(polyThings){
          polyThings.length.should.be.equal(1)
        })
      })
    })
  })
}
