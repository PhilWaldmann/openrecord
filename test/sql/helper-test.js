var should = require('should')
var Utils = require('../../lib/utils') // include persisten/utils
var Store = require('../../store/sql')

describe('SQL: Helper', function(){
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
      this.attribute('my_id', 'integer', {primary: true})
      this.attribute('login', 'string')
      this.hasMany('posts')
      this.hasMany('threads')
      this.hasMany('unread_posts')
      this.hasMany('unread', {through: 'unread_posts'})
      this.hasMany('unread_threads', {through: 'unread', relation: 'thread'})
      this.hasMany('poly_things')
      this.hasMany('members', {through: 'poly_things', relation: 'member'})
    })

    store.Model('Thread', function(){
      this.attribute('id', 'integer', {primary: true})
      this.attribute('title', 'string')
      this.belongsTo('user')
      this.hasMany('posts')
    })

    store.Model('Post', function(){
      this.attribute('aid', 'integer', {primary: true})
      this.belongsTo('user')
      this.belongsTo('thread')
    })

    store.Model('UnreadPost', function(){
      this.attribute('id', 'integer', {primary: true})
      this.belongsTo('user')
      this.belongsTo('unread', {model: 'Post'})
    })

    store.Model('PolyThing', function(){
      this.attribute('id', 'integer', {primary: true})
      this.belongsTo('member', {polymorph: true})
    })
  })




  describe('sanitizeRelations()', function(){
    it('works with a single relation', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, 'posts')
        result.length.should.be.equal(1)
        result[0].name_tree.should.be.eql(['posts'])
        next()
      })
    })


    it('works with a single relation as an array', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, ['posts'])
        result.length.should.be.equal(1)
        result[0].name_tree.should.be.eql(['posts'])
        next()
      })
    })


    it('works with a multiple relations', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, ['posts', 'threads'])
        result.length.should.be.equal(2)
        result[0].name_tree.should.be.eql(['posts'])
        result[1].name_tree.should.be.eql(['threads'])
        next()
      })
    })


    it('works with nested relations', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, {posts: 'thread'})
        result.length.should.be.equal(2)
        result[0].name_tree.should.be.eql(['posts'])
        result[1].name_tree.should.be.eql(['posts', 'thread'])
        next()
      })
    })


    it('works with nested relations as an array', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, ['posts', {threads: 'posts'}])
        result.length.should.be.equal(3)
        result[0].name_tree.should.be.eql(['posts'])
        result[1].name_tree.should.be.eql(['threads'])
        result[2].name_tree.should.be.eql(['threads', 'posts'])
        next()
      })
    })

    it('works with deeply nested relations', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, ['posts', {threads: {posts: 'user'}}])
        result.length.should.be.equal(4)
        result[0].name_tree.should.be.eql(['posts'])
        result[1].name_tree.should.be.eql(['threads'])
        result[2].name_tree.should.be.eql(['threads', 'posts'])
        result[3].name_tree.should.be.eql(['threads', 'posts', 'user'])
        next()
      })
    })

    it('works with through relations', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, ['unread'])
        result.length.should.be.equal(2)
        result[0].name_tree.should.be.eql(['unread_posts'])
        result[1].name_tree.should.be.eql(['unread_posts', 'unread'])
        next()
      })
    })

    it('works with nested relations and through', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, {threads: {user: 'unread'}})
        result.length.should.be.equal(4)
        result[0].name_tree.should.be.eql(['threads'])
        result[1].name_tree.should.be.eql(['threads', 'user'])
        result[2].name_tree.should.be.eql(['threads', 'user', 'unread_posts'])
        result[3].name_tree.should.be.eql(['threads', 'user', 'unread_posts', 'unread'])
        next()
      })
    })

    it('works with multiple through relations', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, ['unread_threads'])
        result.length.should.be.equal(3)
        result[0].name_tree.should.be.eql(['unread_posts'])
        should.not.exist(result[0].as)
        result[1].name_tree.should.be.eql(['unread_posts', 'unread'])
        should.not.exist(result[1].as)
        result[2].name_tree.should.be.eql(['unread_posts', 'unread', 'thread'])
        result[2].as.should.be.eql(['unread_threads'])
        next()
      })
    })

    it('works with multiple nested through relations', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, {unread_threads: {user: 'unread'}})
        result.length.should.be.equal(6)
        result[0].name_tree.should.be.eql(['unread_posts'])
        result[1].name_tree.should.be.eql(['unread_posts', 'unread'])
        result[2].name_tree.should.be.eql(['unread_posts', 'unread', 'thread'])
        result[2].as.should.be.eql(['unread_threads'])
        result[3].name_tree.should.be.eql(['unread_posts', 'unread', 'thread', 'user'])
        should.not.exist(result[3].as)
        result[4].name_tree.should.be.eql(['unread_posts', 'unread', 'thread', 'user', 'unread_posts'])
        should.not.exist(result[4].as)
        result[5].name_tree.should.be.eql(['unread_posts', 'unread', 'thread', 'user', 'unread_posts', 'unread'])
        result[5].as.should.be.eql(['unread_posts', 'unread', 'thread', 'user', 'unread'])
        next()
      })
    })


    it('works with nested polymorphic relation', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, {members: 'user'})
        result.length.should.be.equal(2)
        result[0].name_tree.should.be.eql(['poly_things'])
        result[1].name_tree.should.be.eql(['poly_things', 'member'])
        result[1].sub_relations.should.be.eql('user')
        next()
      })
    })

    it('works with nested polymorphic relations', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeRelations(User, {members: ['user', 'thread']})
        result.length.should.be.equal(2)
        result[0].name_tree.should.be.eql(['poly_things'])
        result[1].name_tree.should.be.eql(['poly_things', 'member'])
        result[1].sub_relations.should.be.eql(['user', 'thread'])
        next()
      })
    })
  })


  describe('sanitizeConditions()', function(){
    it('works with a simple hash conditions', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeConditions(User, {login: 'phil'})

        result.length.should.be.equal(1)
        result[0].name_tree.should.be.eql([])
        result[0].model.should.be.eql(User)

        next()
      })
    })

    it('works with a hasMany through relation', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var Thread = store.Model('Thread')
        var result = Utils.sanitizeConditions(User, {unread_threads: {title_like: 'first'}})
        result.length.should.be.equal(1)
        result[0].name_tree.should.be.eql(['unread_posts', 'unread', 'thread'])
        result[0].model.should.be.eql(Thread)

        next()
      })
    })

    it('works with null values', function(next){
      store.ready(function(){
        var User = store.Model('User')
        var result = Utils.sanitizeConditions(User, {login: null})
        result.length.should.be.equal(1)
        result[0].name_tree.should.be.eql([])
        result[0].model.should.be.eql(User);
        (result[0].value === null).should.be.equal(true)
        next()
      })
    })
  })



  describe('nameTreeToRelation()', function(){
    it('works with one element', function(next){
      store.ready(function(){
        var result = Utils.nameTreeToRelation(['aa'])
        result.should.be.equal('aa')
        next()
      })
    })

    it('works with two elements', function(next){
      store.ready(function(){
        var result = Utils.nameTreeToRelation(['aa', 'bb'])
        result.should.be.eql({aa: 'bb'})
        next()
      })
    })

    it('works with three elements', function(next){
      store.ready(function(){
        var result = Utils.nameTreeToRelation(['aa', 'bb', 'cc'])
        result.should.be.eql({aa: {bb: 'cc'}})
        next()
      })
    })
  })



  describe('nameTreeToCondition()', function(){
    it('works with one element', function(next){
      store.ready(function(){
        var result = Utils.nameTreeToCondition(['aa'], {foo: 'bar'})
        result.should.be.eql({aa: {foo: 'bar'}})
        next()
      })
    })

    it('works with two elements', function(next){
      store.ready(function(){
        var result = Utils.nameTreeToCondition(['aa', 'bb'], {foo: 'bar'})
        result.should.be.eql({aa: {bb: {foo: 'bar'}}})
        next()
      })
    })

    it('works with three elements', function(next){
      store.ready(function(){
        var result = Utils.nameTreeToCondition(['aa', 'bb', 'cc'], {foo: 'bar'})
        result.should.be.eql({aa: {bb: {cc: {foo: 'bar'}}}})
        next()
      })
    })
  })
})
