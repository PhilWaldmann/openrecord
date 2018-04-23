var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Promise', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {})
      store.Model('Post', function() {
        this.validatesPresenceOf('message')
      })
    })

    it('has then() function', function() {
      return store.ready(function() {
        var User = store.Model('User')
        User.find(1)
          .exec()
          .then.should.be.a.Function()
      })
    })

    it('returns select results', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(1)
          .exec()
          .then(function(result) {
            result.should.be.instanceof(User)
          })
      })
    })

    it('returns select results multiple times', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(1)
          .exec(function(result) {
            result.should.be.instanceof(User)
            return result
          })
          .then(function(result) {
            result.should.be.instanceof(User)
          })
      })
    })

    it('saves a record', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(1).exec(function(result) {
          result.login = 'test'
          return result.save().then(function() {})
        })
      })
    })

    it('destroys a record', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.find(2).exec(function(result) {
          return result.destroy().then(function() {})
        })
      })
    })

    it('destroys multiple records', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        return Post.find(1, 2)
          .destroyAll()
          .then(function() {})
      })
    })

    it('destroys multiple records', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        return Post.find(3, 4)
          .deleteAll()
          .then(function() {})
      })
    })

    it('destroys multiple records', function() {
      return store.ready(function() {
        var User = store.Model('User')
        return User.where({ id_gt: 2 })
          .destroy()
          .then(function() {})
      })
    })

    it('calls throws an error on invalid query', function() {
      return store
        .ready(function() {
          var User = store.Model('User')
          return User.where('foo=blaa')
        })
        .should.be.rejectedWith(Error) // TODO: SQLError Object...
    })

    it('create multiple records', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        return Post.create({ message: 'first promise' })
          .then(function() {
            return Post.create({ message: 'second promise' })
          })
          .then(function() {
            return Post.create({ message: 'third promise' })
          })
          .then(function() {
            return Post.where({ message_like: 'promise' }).exec()
          })
          .then(function(posts) {
            posts.length.should.be.equal(3)
          })
      })
    })

    it('create multiple records with an validation error', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        return Post.create({ message: 'first pro_mise' })
          .then(function() {
            return Post.create({ message: 'second pro_mise' })
          })
          .then(function() {
            return Post.create({})
          })
          .catch(function(error) {
            // creates are not part of the same transaction...
            if (error instanceof store.ValidationError) return
            throw error
          })
          .then(function() {
            return Post.where({ message_like: 'pro_mise' }).exec()
          })
          .then(function(posts) {
            posts.length.should.be.equal(2)
          })
      })
    })

    it('create multiple records with all()', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        return Promise.all([
          Post.create({ message: 'first element' }),
          Post.create({ message: 'second element' }),
          Post.create({ message: 'third element' })
        ])
          .then(function(results) {
            results
              .map(function(r) {
                return r.id
              })
              .sort()
              .should.be.eql([11, 12, 13])
            return Post.where({ message_like: 'element' }).exec()
          })
          .then(function(posts) {
            posts.length.should.be.equal(3)
          })
      })
    })
  })
}
