var should = require('should')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Delete dependent', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {
        this.hasMany('posts')
        this.hasMany('threads')
        this.hasMany('poly_things', { as: 'member', dependent: 'delete' })
      })
      store.Model('Post', function() {
        this.belongsTo('user')
        this.belongsTo('thread', { dependent: 'delete' })
        this.hasMany('poly_things', { as: 'member', dependent: 'delete' })
      })
      store.Model('Thread', function() {
        this.belongsTo('user')
        this.hasMany('posts', { dependent: 'delete' })
        this.hasMany('poly_things', { as: 'member', dependent: 'delete' })
      })
      store.Model('PolyThing', function() {
        this.belongsToPolymorphic('member', { dependent: { Thread: 'delete' } })
      })
    })

    it('delete hasMany', function() {
      return store.ready(function() {
        var Thread = store.Model('Thread')
        var Post = store.Model('Post')

        return Thread.find(1)
          .then(function(thread) {
            return thread.destroy()
          })
          .then(function() {
            return Post.find([1, 2])
          })
          .then(function(posts) {
            posts.length.should.be.equal(0)
          })
      })
    })

    it('delete belongsTo', function() {
      return store.ready(function() {
        var Thread = store.Model('Thread')
        var Post = store.Model('Post')

        return Post.find(3)
          .then(function(post) {
            return post.destroy()
          })
          .then(function() {
            return Thread.find(2)
          })
          .then(function(thread) {
            should.not.exist(thread)
          })
      })
    })

    it('delete polymorph hasMany', function() {
      return store.ready(function() {
        var PolyThing = store.Model('PolyThing')
        var Post = store.Model('Post')

        return Post.find(4)
          .then(function(post) {
            return post.destroy()
          })
          .then(function() {
            return PolyThing.find(1)
          })
          .then(function(polyThing) {
            should.not.exist(polyThing)
          })
      })
    })

    it('delete belongsToPolymorphic', function() {
      return store.ready(function() {
        var PolyThing = store.Model('PolyThing')
        var Thread = store.Model('Thread')

        return PolyThing.find(3)
          .include('member')
          .then(function(poly) {
            should.exist(poly._member)
            return poly.destroy()
          })
          .then(function() {
            return Thread.find(4)
          })
          .then(function(thread) {
            should.not.exist(thread)
          })
      })
    })

    it('no delete belongsToPolymorphic (different target model)', function() {
      return store.ready(function() {
        var PolyThing = store.Model('PolyThing')
        var Post = store.Model('Post')

        return PolyThing.find(4)
          .include('member')
          .then(function(poly) {
            should.exist(poly._member)
            return poly.destroy()
          })
          .then(function() {
            return Post.find(5)
          })
          .then(function(post) {
            should.exist(post)
          })
      })
    })
  })
}
