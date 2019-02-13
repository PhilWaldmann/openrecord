var should = require('should')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Updates', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      storeConf.autoSave = true
      storeConf.internalAttributeName = function(name) {
        if (name === 'E-Mail') return 'email'
        return name
      }

      storeConf.externalAttributeName = function(name) {
        if (name === 'email') return 'E-Mail'
        return name
      }
      store = new Store(storeConf)

      store.Model('User', function() {
        this.hasMany('posts')
        this.hasMany('threads')

        this.beforeUpdate(function() {
          this.save.should.be.a.Function()
          if (this.login === 'max') throw new Error('stop')
        })

        this.beforeUpdate(function() {
          this.save.should.be.a.Function()
          if (this.login === 'maxi') throw new Error('stop')
        })

        this.beforeSave(function() {
          this.save.should.be.a.Function()
          if (this.login === '_max') throw new Error('stop')
        })

        this.afterSave(function() {
          this.save.should.be.a.Function()
          if (this.login === '_maxi') throw new Error('stop')
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
      })
    })

    describe('beforeUpdate()', function() {
      it('gets called', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.find(1).then(function(phil) {
              phil.login = 'max'
              return phil.save()
            })
          })
          .should.be.rejectedWith(Error, { message: 'stop' })
      })
    })

    describe('afterUpdate()', function() {
      it('gets called', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.find(1).then(function(phil) {
              phil.login = 'maxi'
              return phil.save()
            })
          })
          .should.be.rejectedWith(Error, { message: 'stop' })
      })
    })

    describe('beforeSave()', function() {
      it('gets called', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.find(1).then(function(phil) {
              phil.login = '_max'
              return phil.save()
            })
          })
          .should.be.rejectedWith(Error, { message: 'stop' })
      })
    })

    describe('afterSave()', function() {
      it('gets called', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.find(1).then(function(phil) {
              phil.login = '_maxi'
              return phil.save()
            })
          })
          .should.be.rejectedWith(Error, { message: 'stop' })
      })
    })

    describe('update', function() {
      it('updates a single record', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(4)
            .then(function(admin) {
              admin.login = 'philipp'
              return admin.save()
            })
            .then(function() {
              return User.where({ login: 'philipp' }).first()
            })
            .then(function(philipp) {
              philipp.login.should.be.equal('philipp')
              philipp.id.should.be.equal(4)
            })
        })
      })

      it('updates a single record via update()', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(4)
            .then(function(admin) {
              return admin.update({ login: 'philipp!!' })
            })
            .then(function() {
              return User.where({ login: 'philipp!!' }).first()
            })
            .then(function(philipp) {
              philipp.login.should.be.equal('philipp!!')
              philipp.id.should.be.equal(4)
            })
        })
      })

      it('updates a single record and set a value to null', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(3)
            .then(function(admin) {
              admin.login.should.be.equal('admin')

              admin.login = 'sysadmin'
              admin.email = null

              return admin.save()
            })
            .then(function() {
              return User.where({ login: 'sysadmin' }).first()
            })
            .then(function(administrator) {
              administrator.login.should.be.equal('sysadmin')
              administrator.id.should.be.equal(3)
              should.not.exist(administrator.email)
            })
        })
      })

      it('updates a nested records', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(2)
            .include('posts')
            .exec(function(michl) {
              michl.login.should.be.equal('michl')
              michl.posts.length.should.be.equal(1)
              michl.posts[0].id.should.be.equal(4)
              michl.posts[0].message.should.be.equal('michls post')

              michl.login = 'michael'
              michl.posts[0].message = 'michaels post'
              michl.posts[0].__exists.should.be.equal(true)

              return michl.save()
            })
            .then(function() {
              return User.where({ login: 'michael' })
                .include('posts')
                .first()
            })
            .then(function(michael) {
              michael.login.should.be.equal('michael')
              michael.id.should.be.equal(2)
              michael.posts[0].message.should.be.equal('michaels post')
              michael.posts[0].id.should.be.equal(4)
              michael.posts.length.should.be.equal(1)
            })
        })
      })

      it('create only nested record', function() {
        return store.ready(function() {
          var User = store.Model('User')
          var Post = store.Model('Post')
          return User.find(3)
            .include('posts')
            .exec(function(admin) {
              admin.posts.length.should.be.equal(0)

              admin.posts.add({ thread_id: 99, message: 'admin was here' })

              return admin.save()
            })
            .then(function() {
              return Post.where({ user_id: 3 }).count()
            })
            .then(function(result) {
              result.should.be.equal(1)
            })
        })
      })

      it('updates a record and adds new nested records', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          return Thread.find(1)
            .include('posts')
            .exec(function(thread) {
              thread.title.should.be.equal('first thread')
              thread.posts.length.should.be.equal(3)

              thread.title = 'Phils first thread'
              thread.posts.add({ user_id: 1, message: 'another post' })
              thread.posts.add({ user_id: 2, message: 'one more' })

              return thread.save()
            })
            .then(function() {
              return Thread.find(1).include('posts')
            })
            .then(function(thread) {
              thread.title.should.be.equal('Phils first thread')
              thread.posts.length.should.be.equal(5)
            })
        })
      })

      it('updates relations via set()', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          return Thread.find(2)
            .include('posts')
            .exec(function(thread) {
              thread.title.should.be.equal('second thread')
              thread.posts.length.should.be.equal(1)
              thread.posts[0].message.should.be.equal('third')

              thread.set({
                title: 'second awesome thread',
                posts: [
                  {
                    id: 3,
                    message: 'third awesome post'
                  }
                ]
              })

              return thread.save()
            })
            .then(function() {
              return Thread.find(2).include('posts')
            })
            .then(function(thread) {
              thread.title.should.be.equal('second awesome thread')
              thread.posts.length.should.be.equal(1)
              thread.posts[0].message.should.be.equal('third awesome post')
            })
        })
      })

      it('adds relations via set()', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          return Thread.find(3)
            .include('posts')
            .exec(function(thread) {
              thread.title.should.be.equal('another')
              thread.posts.length.should.be.equal(0)

              thread.set({
                title: 'another awesome thread',
                posts: [
                  {
                    message: 'another awesome post'
                  }
                ]
              })

              return thread.save()
            })
            .then(function() {
              return Thread.find(3).include('posts')
            })
            .then(function(thread) {
              thread.title.should.be.equal('another awesome thread')
              thread.posts.length.should.be.equal(1)
              thread.posts[0].message.should.be.equal('another awesome post')
            })
        })
      })

      it('updates relations via set() without including the relation', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          return Thread.find(4)
            .exec(function(thread) {
              thread.title.should.be.equal('thread 4')

              thread.set({
                title: 'awesome thread 4',
                posts: [
                  {
                    id: 5,
                    message: 'you got an update'
                  }
                ]
              })

              return thread.save()
            })
            .then(function() {
              return Thread.find(4).include('posts')
            })
            .then(function(thread) {
              thread.title.should.be.equal('awesome thread 4')
              thread.posts.length.should.be.equal(1)
              thread.posts[0].message.should.be.equal('you got an update')
            })
        })
      })

      it('updates a relation id with original relation loaded (belongsTo)', function() {
        return store.ready(function() {
          var Thread = store.Model('Thread')
          return Thread.find(4)
            .include('user')
            .exec(function(thread) {
              thread._user.login.should.be.equal('phil')

              thread.user_id = 5
              should.not.exist(thread._user)

              return thread.save()
            })
            .then(function() {
              return Thread.find(4).include('user')
            })
            .then(function(thread) {
              thread._user.login.should.be.equal('new_owner')
            })
        })
      })
    })

    describe('updateAll', function() {
      it('update multiple records', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ id_gt: 1 })
            .updateAll({ 'E-Mail': 'censored' })
            .then(function() {
              return User.order('id')
            })
            .then(function(users) {
              users[0].id.should.be.equal(1)
              users[0]['E-Mail'].should.be.equal('phil@mail.com')
              users[1]['E-Mail'].should.be.equal('censored')
              users[2]['E-Mail'].should.be.equal('censored')
              users[3]['E-Mail'].should.be.equal('censored')
              users[4]['E-Mail'].should.be.equal('censored')
            })
        })
      })


      it('update multiple records with limit() and offset()', function() {
        if (title === 'SQL (MySQL)') return Promise.resolve() // not supported in mysql <= 8.0
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ id_gt: 1 }).limit(2).offset(1).order('id')
            .updateAll({ 'E-Mail': 'uncensored' })
            .then(function() {
              return User.order('id')
            })
            .then(function(users) {
              users[0].id.should.be.equal(1)
              users[0]['E-Mail'].should.be.equal('phil@mail.com')
              users[1]['E-Mail'].should.be.equal('censored')
              users[2]['E-Mail'].should.be.equal('uncensored')
              users[3]['E-Mail'].should.be.equal('uncensored')
              users[4]['E-Mail'].should.be.equal('censored')
            })
        })
      })


      it('update all records', function() {
        if (title === 'SQL (MySQL)') return Promise.resolve() // not supported in mysql <= 8.0
        return store.ready(function() {
          var User = store.Model('User')
          return User.updateAll({ 'E-Mail': 'uncensored' })
            .then(function() {
              return User.order('id')
            })
            .then(function(users) {
              users[0].id.should.be.equal(1)
              users[0]['E-Mail'].should.be.equal('uncensored')
              users[1]['E-Mail'].should.be.equal('uncensored')
              users[2]['E-Mail'].should.be.equal('uncensored')
              users[3]['E-Mail'].should.be.equal('uncensored')
              users[4]['E-Mail'].should.be.equal('uncensored')
            })
        })
      })
    })
  })
}
