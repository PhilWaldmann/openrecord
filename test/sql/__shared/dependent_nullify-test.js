var should = require('should')
var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Nullify dependent', function(){
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
      })
      store.Model('Post', function(){
        this.belongsTo('user')
        this.belongsTo('thread')
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts', {dependent: 'nullify'})
      })
    })


    it('hasMany', function(){
      return store.ready(function(){
        var Thread = store.Model('Thread')
        var Post = store.Model('Post')

        return Thread.find(1)
        .then(function(thread){
          return thread.destroy()
        }).then(function(){
          return Post.find([1, 2])
        }).then(function(posts){
          posts.length.should.be.equal(2)
          should.not.exist(posts[0].thread_id)
          should.not.exist(posts[1].thread_id)
        })
      })
    })
  })
}
