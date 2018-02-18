var should = require('should')
var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Delete dependent', function(){
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
        this.hasMany('poly_things', {as: 'member', dependent: 'delete'})
      })
      store.Model('Post', function(){
        this.belongsTo('user')
        this.belongsTo('thread', {dependent: 'delete'})
        this.hasMany('poly_things', {as: 'member', dependent: 'delete'})
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts', {dependent: 'delete'})
        this.hasMany('poly_things', {as: 'member', dependent: 'delete'})
      })
      store.Model('PolyThing', function(){
        this.belongsTo('member', {polymorph: true})
      })
    })


    it('delete hasMany', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        var Post = store.Model('Post')

        return Thread.find(1, function(thread){
          return thread.destroy(function(){
            return Post.find([1, 2], function(posts){
              posts.length.should.be.equal(0)
            })
          })
        })
      })
    })


    it('delete belongsTo', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        var Post = store.Model('Post')

        return Post.find(3, function(post){
          return post.destroy(function(){
            return Thread.find(2, function(thread){
              should.not.exist(thread)
            })
          })
        })
      })
    })


    it('delete polymorph hasMany', function(){
      return store.ready(function(){
        var PolyThing = store.Model('PolyThing')
        var Post = store.Model('Post')

        return Post.find(4, function(post){
          return post.destroy(function(){
            return PolyThing.find(1, function(polyThing){
              should.not.exist(polyThing)
            })
          })
        })
      })
    })
  })
}
