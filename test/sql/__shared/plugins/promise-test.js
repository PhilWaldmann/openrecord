var should = require('should')
var path = require('path')
var Store = require('../../../../lib/store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Promise Changes', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      storeConf.plugins = path.join(__dirname, '..', '..', '..', 'fixtures', 'plugins', 'promise-*.js')

      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('User', function(){
        this.belongsTo('nothing')
        this.hasMany('posts')
        this.hasMany('threads')
      })
      store.Model('Post', function(){
        this.belongsTo('user')
        this.belongsTo('thread')

        this.validatesPresenceOf('message')
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts')
      })
    })


    describe('create()', function(){
      it('returns the record instead of success', function(next){
        store.ready(function(){
          var Thread = store.Model('Thread')

          Thread.create({
            title: 'foo'
          }, function(result){
            result.title.should.be.equal('foo')
            next()
          })
        })
      })

      it('returns the record instead of success with then()', function(next){
        store.ready(function(){
          var Thread = store.Model('Thread')

          Thread.create({
            title: 'foo'
          })
            .then(function(result){
              result.title.should.be.equal('foo')
              next()
            })
        })
      })


      it('throws an error on failed validation', function(next){
        store.ready(function(){
          var Post = store.Model('Post')

          Post.create({
            thread_id: 1
          })
            .then(function(result){
              should.not.exit(result)
            })
            .catch(function(error){
              error.message.should.be.equal('validation failed')
              next()
            })
        })
      })
    })

    describe('save()', function(){
      it('returns the record instead of success', function(next){
        store.ready(function(){
          var Thread = store.Model('Thread')

          Thread.find(1).exec()
            .then(function(record){
              record.title = 'bar'
              return record.save()
            })
            .then(function(record){
              record.title.should.be.equal('bar')
              next()
            })
        })
      })
    })
  })
}
