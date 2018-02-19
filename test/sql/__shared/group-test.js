var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Group', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      store.Model('Post', function(){

      })
    })


    it('group one field without select', function(){
      return store.ready(function(){
        var Post = store.Model('Post')

        return Post.group('message').order('message').exec(function(posts){
          posts.should.be.eql([{
            message: 'first'
          }, {
            message: 'second'
          }, {
            message: 'third'
          }])
        })
      })
    })


    it('group two field without select', function(){
      return store.ready(function(){
        var Post = store.Model('Post')

        return Post.group('thread_id', 'message').order('message', 'thread_id').exec(function(posts){
          posts.should.be.eql([
            { thread_id: 1, message: 'first' },
            { thread_id: 2, message: 'first' },
            { thread_id: 1, message: 'second' },
            { thread_id: 2, message: 'third' }
          ])
        })
      })
    })


    it('group with select', function(){
      return store.ready(function(){
        var Post = store.Model('Post')

        return Post.group('message').select('message', 'COUNT(*) count').order('message').exec(function(posts){
          posts.should.be.eql([
            {message: 'first', count: 2},
            {message: 'second', count: 1},
            {message: 'third', count: 1}
          ])
        })
      })
    })

    it('group with raw having', function(){
      return store.ready(function(){
        var Post = store.Model('Post')

        return Post.group('message').select('message', 'COUNT(*) count').having('COUNT(*) > ?', 1).order('message').exec(function(posts){
          posts.should.be.eql([
            {message: 'first', count: 2}
          ])
        })
      })
    })

    it('group with hash having', function(){
      return store.ready(function(){
        var Post = store.Model('Post')

        return Post.group('message', 'thread_id').select('message', 'COUNT(*) count').having({thread_id_gt: 1}).order('message').exec(function(posts){
          posts.should.be.eql([
            { message: 'first', count: 1 },
            { message: 'third', count: 1 }
          ])
        })
      })
    })
  })
}
