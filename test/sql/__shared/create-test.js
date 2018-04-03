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
      storeConf.autoSave = true
      store = new Store(storeConf)


      store.Model('User', function(){
        this.hasMany('posts')
        this.hasMany('threads')

        this.beforeCreate(function(record, options){
          this.save.should.be.a.Function()
          if(this.login === 'find_inside'){
            return Post.find(1).useTransaction(options.transaction)
          }else{
            if(this.login === 'max') throw new Error('stop')
          }
        })

        this.afterCreate(function(){
          this.save.should.be.a.Function()
          if(this.login === 'maxi') return Promise.reject(new Error('stop'))
        })


        this.beforeSave(function(){
          this.save.should.be.a.Function()
          if(this.login === '_max') return Promise.reject(new Error('stop'))
        })

        this.afterSave(function(){
          this.save.should.be.a.Function()
          if(this.login === '_maxi') return Promise.reject(new Error('stop'))
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
      it('gets called', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
            login: 'max'
          })
        }).should.be.rejectedWith(Error, {message: 'stop'})
      })
    })


    describe('beforeCreate() with a find() inside', function(){
      it('gets called', function(){
        return store.ready(function(){
          Post = store.Model('Post') // for the beforeCreate Hook
          var User = store.Model('User')

          return User.create({
            login: 'find_inside'
          })
          .then(function(result){
            result.id.should.be.equal(1)
          })
        })
      })
    })


    describe('afterCreate()', function(){
      it('gets called', function(){
        return store.ready(function(){
          var User = store.Model('User')

          return User.create({
            login: 'maxi'
          })
        }).should.be.rejectedWith(Error, {message: 'stop'})
      })

      it('rolls back the transaction', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.where({login: 'maxi'}).count().exec(function(result){
            result.should.be.equal(0)
          })
        })
      })
    })


    describe('beforeSave()', function(){
      it('gets called', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
            login: '_max'
          })
        }).should.be.rejectedWith(Error, {message: 'stop'})
      })
    })


    describe('afterSave()', function(){
      it('gets called', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
            login: '_maxi'
          })
        }).should.be.rejectedWith(Error, {message: 'stop'})
      })

      it('rolls back the transaction', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.where({login: '_maxi'}).count().exec(function(result){
            result.should.be.equal(0)
          })
        })
      })
    })



    describe('create()', function(){
      it('has the right context', function(){
        return store.ready(function(){
          var User = store.Model('User')

          return User.create({
            login: 'my_login',
            email: 'my_mail@mail.com'
          })
          .then(function(user){
            user.login.should.be.equal('my_login')
          })
        })
      })


      it('works on a chain', function(){
        return store.ready(function(){
          var User = store.Model('User')

          return User.setContext({foo: 'bar'}).create({
            login: 'my_login2',
            email: 'my_mail@mail.com'
          })
          .then(function(user){
            user.login.should.be.equal('my_login2')
          })
        })
      })


      it('writes a new record', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
            login: 'phil',
            email: 'phil@mail.com'
          })
          .then(function(){
            return User.where({login: 'phil'}).count().exec(function(result){
              result.should.be.equal(1)
            })
          })
        })
      })


      it('writes a new record, but ignores the id (auto increment)', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
            id: 99,
            login: 'philipp',
            email: 'philipp@mail.com'
          })
          .then(function(){
            return User.where({login: 'philipp'}).limit(1).exec(function(result){
              result.id.should.not.be.equal(99)
            })
          })
        })
      })


      it('writes a new record with subrecords', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
            login: 'michl',
            email: 'michl@mail.com',
            threads: [{
              title: 'Thread one'
            }, {
              title: 'Thread two'
            }]
          })
          .then(function(){
            return User.where({login: 'michl'}).include('threads').limit(1).exec(function(result){
              result.login.should.be.equal('michl')
              result.threads.length.should.be.equal(2)
            })
          })
        })
      })


      it('writes a new record with nested subrecords', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
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
          })
          .then(function(){
            return User.where({login: 'admin'}).include({threads: 'posts'}).limit(1).exec(function(result){
              result.login.should.be.equal('admin')
              result.threads.length.should.be.equal(2)
              result.threads[0].posts.length.should.be.equal(2)
            })
          })
        })
      })


      it('does not write on validation errors', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create({
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
          })
        }).should.be.rejectedWith(Error, {message: 'stop'})
      })


      it('rolls back the transaction', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.where({login: 'max'}).include({threads: 'posts'}).limit(1).exec(function(result){
            should.not.exist(result)
          })
        })
      })


      it('create multiple records at once', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.create([
            {login: 'user1'},
            {login: 'user2'},
            {login: 'user3'}
          ])
          .then(function(result){
            result.length.should.be.equal(3)
            should.exist(result[0].id)
            should.exist(result[1].id)
            should.exist(result[2].id)
          })
        })
      })


      it('always adds the right ids', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var id

          return User.create({login: 'test1'})
          .then(function(user){
            id = user.id
            return User.find(id).delete()
          })
          .then(function(){
            return User.create({login: 'test2'})
          })
          .then(function(user2){
            user2.id.should.be.equal(id + 1)
          })
        })
      })
    })
  })
}
