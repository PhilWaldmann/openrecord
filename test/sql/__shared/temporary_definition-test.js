var should = require('should')
var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Temporary Definition', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      store.Model('User', function(){
        this.hasMany('posts')

        this.scope('tmpValidation', function(){
          this.temporaryDefinition()
          .validatesFormatOf('login', /phil.*/)
        })

        this.scope('tmpHook', function(){
          this.temporaryDefinition()
          .beforeSave(function(){
            throw new Error('stop')
          })
        })

        this.scope('tmpRelation', function(){
          this.temporaryDefinition()
          .hasMany('threads')
        })

        this.scope('tmpAttribute', function(){
          this.temporaryDefinition()
          .attribute('LOGIN', String)
          .convert('output', 'LOGIN', function(){
            return this.login.toUpperCase()
          })
        })

        this.scope('tmpConversion', function(){
          this.temporaryDefinition()
          .convertOutput('login', function(value){
            if(!value) return value            
            return value.split('').reverse().join('')
          }, false)
        })
      })
      store.Model('Post', function(){
        this.belongsTo('user')
        this.belongsTo('thread')
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts')
      })
    })


    it('adds a temporary validation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.tmpValidation().create({ login: 'max' })
      }).should.be.rejectedWith(store.ValidationError, {
        errors: {login: ['not a valid format']}
      })
    })


    it('does not pollute the model validation definition', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.create({ login: 'max' })
        .then(function(result){
          result.id.should.be.equal(5)
        })
      })
    })



    it('adds a temporary beforeSave hook', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.tmpHook().create({ login: 'max' })
      }).should.be.rejectedWith(Error, {
        message: 'stop'
      })
    })


    it('does not pollute the model hooks definition', function(){
      return store.ready(function(){
        var User = store.Model('User')
        User.create({ login: 'max' })
        .then(function(result){
          result.id.should.be.equal(6)
        })
      })
    })



    it('adds a temporary relation', function(){
      return store.ready(function(){
        var User = store.Model('User')
        User.tmpRelation().include('threads')
      })
    })


    it('does not pollute the model relations definition', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.include('threads').exec()
      }).should.be.rejectedWith(store.RelationNotFoundError, {
        message: 'Can\'t find relation "threads" for User'
      })
    })




    it('adds a temporary attribute', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.tmpAttribute().find(1).exec(function(user){
          user.LOGIN.should.be.equal('PHIL')
        })
      })
    })


    it('does not pollute the model attribute definition', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).exec(function(user){
          should.not.exist(user.LOGIN)
        })
      })
    })



    it('adds a temporary conversion', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.tmpConversion().find(1).exec(function(user){
          user.login.should.be.equal('lihp')
        })
      })
    })


    it('does not pollute the model conversion definition', function(){
      return store.ready(function(){
        var User = store.Model('User')
        return User.find(1).exec(function(user){
          user.login.should.be.equal('phil')
        })
      })
    })
    
  })
}
