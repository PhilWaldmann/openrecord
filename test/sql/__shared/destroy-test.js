var should = require('should')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Destroy', function() {
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

        this.beforeDestroy(function() {
          this.save.should.be.a.Function()
          if (this.login === 'max') throw new Error('stop from user before')
        })

        this.afterDestroy(function() {
          this.save.should.be.a.Function()
          if (this.login === 'maxi') throw new Error('stop from user after')
        })
      })
      store.Model('Post', function() {
        this.belongsTo('user')
        this.belongsTo('thread')

        this.validatesPresenceOf('message')
      })
      store.Model('Thread', function() {
        this.belongsTo('user')
        this.hasMany('posts')
        this.beforeDestroy(function() {
          if (this.title === 'do not destroy')
            throw new Error('stop from thread before')
        })
      })
    })

    describe('beforeDestroy()', function() {
      it('gets called', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.find(1).then(function(phil) {
              phil.login = 'max'
              return phil.destroy()
            })
          })
          .should.be.rejectedWith(Error, { message: 'stop from user before' })
      })
    })

    describe('afterDestroy()', function() {
      it('gets called', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.find(1).then(function(phil) {
              phil.login = 'maxi'
              return phil.destroy()
            })
          })
          .should.be.rejectedWith(Error, { message: 'stop from user after' })
      })
    })

    describe('destroy()', function() {
      it('destroy a single record', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(1)
            .then(function(phil) {
              phil.login.should.be.equal('phil')

              return phil.destroy()
            })
            .then(function(phil) {
              phil.__exists.should.be.equal(false)
              return User.find(1)
            })
            .then(function(phil) {
              should.not.exist(phil)
            })
        })
      })
    })

    describe('destroyAll()', function() {
      it('delets all records with calling beforeDestroy or afterDestroy', function() {
        return store
          .ready(function() {
            var Thread = store.Model('Thread')

            return Thread.where({ title_like: 'destroy' }).destroyAll()
          })
          .should.be.rejectedWith(Error, { message: 'stop from thread before' })
      })
    })

    describe('deleteAll()', function() {
      it('delets all records without calling beforeDestroy or afterDestroy', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          return Thread.where({ title_like: 'delete' })
            .deleteAll()
            .then(function() {
              return Thread.where({ title_like: 'delete' })
                .count()
                .exec(function(result) {
                  result.should.be.equal(0)
                })
            })
        })
      })

      it('delets all records of a relation', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          var Post = store.Model('Post')

          return Thread.find(1)
            .then(function(thread) {
              should.exist(thread)

              return thread.posts.deleteAll()
            })
            .then(function() {
              return Post.where({ thread_id: 1 }).count()
            })
            .then(function(result) {
              result.should.be.equal(0)
            })
        })        
      })


      it('delete multiple records with limit() and offset()', function() {
        if (title === 'SQL (MySQL)') return Promise.resolve() // not supported in mysql <= 8.0
        return store.ready(function() {
          var Thread = store.Model('Thread')
          var count
          return Thread.count()
          .then(function(_count){
            count = _count
            return Thread.limit(2).deleteAll()
          })          
          .then(function(){
            return Thread.count()
          })
          .then(function(_count){
            _count.should.be.equal(count - 2)
          })
        })
      })


      it('deletes all records', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          return Thread.deleteAll()        
          .then(function(){
            return Thread.count()
          })
          .then(function(_count){
            _count.should.be.equal(0)
          })
        })
      })
    })
  })
}
