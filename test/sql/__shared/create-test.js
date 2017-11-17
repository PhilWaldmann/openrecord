var should = require('should')
var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Create', function(){
    var store, Post

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('User', function(){
        this.belongsTo('nothing')
        this.hasMany('posts')
        this.hasMany('threads')

        this.beforeCreate(function(record, transaction, done){
          this.save.should.be.a.Function()
          done.should.be.a.Function()

          if(this.login === 'find_inside'){
            Post.find(1).transaction(transaction).exec(function(){
              done(true)
            })
          }else{
            done(this.login !== 'max')
          }
        })

        this.afterCreate(function(){
          this.save.should.be.a.Function()
          return this.login !== 'maxi'
        })


        this.beforeSave(function(){
          this.save.should.be.a.Function()
          return this.login !== '_max'
        })

        this.afterSave(function(){
          this.save.should.be.a.Function()
          return this.login !== '_maxi'
        })
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





    describe('beforeCreate()', function(){
      it('gets called', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: 'max'
          }, function(result){
            result.should.be.equal(false)
            next()
          })
        })
      })
    })


    describe('beforeCreate() with a find() inside', function(){
      it('gets called', function(next){
        store.ready(function(){
          Post = store.Model('Post') // for the beforeCreate Hook
          var User = store.Model('User')
          User.create({
            login: 'find_inside'
          }, function(result){
            result.should.be.equal(true)
            next()
          })
        })
      })
    })


    describe('afterCreate()', function(){
      it('gets called', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: 'maxi'
          }, function(result){
            result.should.be.equal(false)

            User.where({login: 'maxi'}).count().exec(function(result){
              result.should.be.equal(0)
              next()
            })
          })
        })
      })
    })


    describe('beforeSave()', function(){
      it('gets called', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: '_max'
          }, function(result){
            result.should.be.equal(false)
            next()
          })
        })
      })
    })


    describe('afterSave()', function(){
      it('gets called', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: '_maxi'
          }, function(result){
            result.should.be.equal(false)

            User.where({login: '_maxi'}).count().exec(function(result){
              result.should.be.equal(0)
              next()
            })
          })
        })
      })
    })



    describe('create()', function(){
      it('has the right context', function(next){
        store.ready(function(){
          var User = store.Model('User')

          User.create({
            login: 'my_login',
            email: 'my_mail@mail.com'
          }, function(result){
            this.login.should.be.equal('my_login')
            result.should.be.equal(true)
            next()
          })
        })
      })


      it('works on a chain', function(next){
        store.ready(function(){
          var User = store.Model('User')

          User.setContext({foo: 'bar'}).create({
            login: 'my_login2',
            email: 'my_mail@mail.com'
          }, function(result){
            this.login.should.be.equal('my_login2')
            result.should.be.equal(true)
            next()
          })
        })
      })


      it('writes a new record', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: 'phil',
            email: 'phil@mail.com'
          }, function(result){
            result.should.be.equal(true)
            User.where({login: 'phil'}).count().exec(function(result){
              result.should.be.equal(1)
              next()
            })
          })
        })
      })


      it('writes a new record, but ignores the id (auto increment)', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            id: 99,
            login: 'philipp',
            email: 'philipp@mail.com'
          }, function(result){
            result.should.be.equal(true)
            User.where({login: 'philipp'}).limit(1).exec(function(result){
              result.id.should.not.be.equal(99)
              next()
            })
          })
        })
      })


      it('writes a new record with subrecords', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: 'michl',
            email: 'michl@mail.com',
            threads: [{
              title: 'Thread one'
            }, {
              title: 'Thread two'
            }]
          }, function(result){
            result.should.be.equal(true)

            User.where({login: 'michl'}).include('threads').limit(1).exec(function(result){
              result.login.should.be.equal('michl')
              result.threads.length.should.be.equal(2)
              next()
            })
          })
        })
      })


      it('writes a new record with nested subrecords', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: 'admin',
            email: 'admin@mail.com',
            threads: [{
              title: 'Thread one',
              posts: [{
                message: 'Blubb'
              }, {
                message: 'another'
              }]
            }, {
              title: 'Thread two'
            }]
          }, function(result){
            result.should.be.equal(true)

            User.where({login: 'admin'}).include({threads: 'posts'}).limit(1).exec(function(result){
              result.login.should.be.equal('admin')
              result.threads.length.should.be.equal(2)
              result.threads[0].posts.length.should.be.equal(2)
              next()
            })
          })
        })
      })


      it('does not write on validation errors', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.create({
            login: 'max',
            email: 'max@mail.com',
            threads: [{
              title: 'Thread one',
              posts: [{
                message: 'Blubb'
              }, {
                message: null
              }]
            }, {
              title: 'Thread two'
            }]
          }, function(result){
            result.should.be.equal(false)

            User.where({login: 'max'}).include({threads: 'posts'}).limit(1).exec(function(result){
              should.not.exist(result)
              next()
            })
          })
        })
      })
    })
  })
}
