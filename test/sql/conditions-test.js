var Store = require('../../store/sql')

describe('SQL: Conditions', function(){
  var store

  before(function(){
    store = new Store({
      type: 'sql'
    })

    // a store of type sql does not have any data types
    // so just create some dummy types
    store.addOperator('eq', function(){}, {default: true})
    store.addOperator('like', function(){})

    store.addType('string', function(value){
      return value
    }, {operators: {defaults: ['eq', 'like']}})

    store.addType('integer', function(value){
      return value
    }, {operators: {defaults: ['eq', 'like']}})

    store.Model('User', function(){
      this.attribute('my_primary_key', 'integer', {primary: true})
      this.attribute('login', 'string')
      this.hasMany('posts')
    })



    store.Model('Post', function(){
      this.attribute('my_primary_key1', 'integer', {primary: true})
      this.attribute('my_primary_key2', 'integer', {primary: true})
      this.attribute('message', 'string')
    })
  })



  describe('find()', function(){
    it('has method', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.find.should.be.a.Function()
        next()
      })
    })


    describe('with one param', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.find(2)
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.find(2)
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: Chained,
            name_tree: [],
            attribute: 'my_primary_key',
            operator: 'eq',
            value: 2
          }])
          next()
        })
      })
    })



    describe('with multiple param', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.find([2, 3, 4, 5])
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.find([2, 3, 4, 5])
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: Chained,
            attribute: 'my_primary_key',
            operator: 'eq',
            value: [2, 3, 4, 5],
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with multiple primary keys', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var Post = store.Model('Post')
          var Chained = Post.find(4, 899)
          Chained.getInternal('conditions').length.should.be.equal(2)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var Post = store.Model('Post')
          var Chained = Post.find(4, 899)
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: Chained,
            attribute: 'my_primary_key1',
            operator: 'eq',
            value: 4,
            name_tree: []
          }, {
            type: 'hash',
            model: Chained,
            attribute: 'my_primary_key2',
            operator: 'eq',
            value: 899,
            name_tree: []
          }])
          next()
        })
      })
    })
  })








  describe('where()', function(){
    it('has method', function(next){
      store.ready(function(){
        var User = store.Model('User')
        User.where.should.be.a.Function()
        next()
      })
    })

    describe('with hash', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({login: 'phil'})
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({login: 'phil'})
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: User,
            attribute: 'login',
            operator: 'eq',
            value: 'phil',
            name_tree: []
          }])
          next()
        })
      })

      it('does not include unknown attributes', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({unknown: 'phil'})
          Chained.getInternal('conditions').length.should.be.equal(0)
          next()
        })
      })


      it('does include object values', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({login: {attribute: 'foo'}})
          var conds = Chained.getInternal('conditions')
          conds.length.should.be.equal(1)
          conds[0].value.should.have.keys('attribute', 'model', 'name_tree')
          next()
        })
      })
    })

    describe('with hash (like)', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({login_like: 'phil'})
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({login_like: 'phil'})
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: User,
            attribute: 'login',
            operator: 'like',
            value: 'phil',
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with hash (multiple)', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({login_like: 'phil', my_primary_key: [2, 3]})
          Chained.getInternal('conditions').length.should.be.equal(2)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({login_like: 'phil', my_primary_key: [2, 3]})
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: User,
            attribute: 'login',
            operator: 'like',
            value: 'phil',
            name_tree: []
          }, {
            type: 'hash',
            model: User,
            attribute: 'my_primary_key',
            operator: 'eq',
            value: [2, 3],
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with array of hashes', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where([{login_like: 'phil'}, {my_primary_key: [2, 3]}])
          Chained.getInternal('conditions').length.should.be.equal(2)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where([{login_like: 'phil'}, {my_primary_key: [2, 3]}])
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: User,
            attribute: 'login',
            operator: 'like',
            value: 'phil',
            name_tree: []
          }, {
            type: 'hash',
            model: User,
            attribute: 'my_primary_key',
            operator: 'eq',
            value: [2, 3],
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with joined table conditions', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({posts: {my_primary_key1: [1, 2, 3]}})
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Post = store.Model('Post')
          var Chained = User.where({posts: {my_primary_key1: [1, 2, 3]}})
          Chained.getInternal('conditions').should.be.eql([{
            type: 'hash',
            model: Post,
            attribute: 'my_primary_key1',
            operator: 'eq',
            value: [1, 2, 3],
            name_tree: ['posts']
          }])
          next()
        })
      })
    })


    describe('with string', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where('login IS NULL')
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where('login IS NULL')
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: [],
            query: 'login IS NULL',
            name_tree: []
          }])
          next()
        })
      })
    })

    describe('with string and "?" placeholder', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where('login = ?', 'phil')
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where('login = ?', 'phil')
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with array and "?" placeholder', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where(['login = ?', 'phil'])
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where(['login = ?', 'phil'])
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with sting and hash placeholder', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where('login = :login', {login: 'phil'})
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where('login = :login', {login: 'phil'})
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with array and hash placeholder', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where(['login = :login', {login: 'phil'}])
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where(['login = :login', {login: 'phil'}])
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['phil'],
            query: 'login = ?',
            name_tree: []
          }])
          next()
        })
      })
    })


    describe('with array and hash placeholder on a relation', function(){
      it('has conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({posts: ['message = :message', {message: 'hello'}]})
          Chained.getInternal('conditions').length.should.be.equal(1)
          next()
        })
      })

      it('has the right conditions', function(next){
        store.ready(function(){
          var User = store.Model('User')
          var Chained = User.where({posts: ['message = :message', {message: 'hello'}]})
          Chained.getInternal('conditions').should.be.eql([{
            type: 'raw',
            args: ['hello'],
            query: 'message = ?',
            name_tree: ['posts']
          }])
          next()
        })
      })
    })
  })
})
