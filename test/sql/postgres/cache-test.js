const Store = require('../../../lib/store')
const cache = require('../../fixtures/cache/postgres.json')

describe('Postgres: Cache', function(){
  var store
  var database = 'cache_test'


  function withoutChanged(attr){
    const a = Object.assign({}, attr)
    a.name = a.name.replace('_changed', '')
    return a
  }


  before(function(next){
    this.timeout(5000)
    beforePG(database, [
      'CREATE TABLE users(id serial primary key, login TEXT NOT NULL, email TEXT)',
      'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
      'DROP TYPE IF EXISTS my_enum',
      "CREATE type my_enum AS ENUM('foo', 'bar')",
      'DROP TYPE IF EXISTS customtype',
      'CREATE type customtype AS (foo integer, bar text)',
      'CREATE TABLE attribute_tests(id serial primary key, composite_attribute customtype, enum_attribute my_enum)'
    ], next)
  })

  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    })

    store.Model('user', function(){})
    store.Model('post', function(){})
    store.Model('attribute_test', function(){})

    store.setMaxListeners(0)
    store.on('exception', function(){})
  })

  after(function(next){
    afterPG(database, next)
  })


  it('cache contains all models', function(next){
    store.ready(function(){
      store.cache.should.have.keys('user', 'post')
      next()
    })
  })

  it('cache contains model attributes', function(next){
    store.ready(function(){
      store.cache.user.should.have.keys('attributes')
      store.cache.post.should.have.keys('attributes')
      store.cache.user.attributes.should.have.size(3)
      store.cache.post.attributes.should.have.size(4)
      next()
    })
  })

  it('cache contains only necessary attribute information', function(next){
    store.ready(function(){
      store.cache.user.attributes.should.be.eql(cache.user.attributes.map(withoutChanged))
      store.cache.post.attributes.should.be.eql(cache.post.attributes.map(withoutChanged))
      next()
    })
  })

  it('cache contains enum values', function(next){
    store.ready(function(){
      store.cache.attribute_test.attributes[2].should.be.eql({
        name: 'enum_attribute',
        type: 'string',
        options: {
          description: null,
          persistent: true,
          primary: false,
          notnull: false,
          default: null,
          writable: true
        },
        validations: [{
          name: 'validatesInclusionOf', args: [[ 'foo', 'bar' ]]
        }]
      })
      next()
    })
  })


  it('cache contains composite values', function(next){
    store.ready(function(){
      store.cache.attribute_test.attributes[1].should.be.eql({
        name: 'composite_attribute',
        type: 'composite',
        options: {
          description: null,
          persistent: true,
          primary: false,
          notnull: false,
          default: null,
          writable: true
        },
        validations: [],
        type_name: 'customtype',
        type_attributes: [{
          name: 'foo',
          type: 'integer',
          options: {
            description: null,
            persistent: true,
            primary: false,
            notnull: false,
            default: null,
            writable: true
          },
          validations: []
        }, {
          name: 'bar',
          type: 'string',
          options: {
            description: null,
            persistent: true,
            primary: false,
            notnull: false,
            default: null,
            writable: true
          },
          validations: []
        }]
      })
      next()
    })
  })




  describe('Load from cache file', function(){
    var store2
    before(function(){
      store2 = new Store({
        host: 'localhost',
        type: 'postgres',
        database: database,
        user: 'postgres',
        password: '',
        cache: cache
      })
      store2.Model('user', function(){})
      store2.Model('post', function(){})
      store2.Model('attribute_test', function(){})

      store2.setMaxListeners(0)
      store2.on('exception', function(){})
    })


    it('model attributes are defined', function(next){
      store2.ready(function(){
        store2.Model('user').definition.attributes.should.have.keys('id', 'login_changed', 'email')
        store2.Model('post').definition.attributes.should.have.keys('id_changed', 'user_id', 'thread_id', 'message')
        store2.Model('attribute_test').definition.attributes.should.have.keys('id', 'composite_attribute', 'enum_attribute')
        next()
      })
    })

    it('enum validation is defined', function(next){
      store2.ready(function(){
        const AttributeTest = store2.Model('attribute_test')
        const test = AttributeTest.new({enum_attribute: 'foo'})
        test.isValid(function(valid){
          valid.should.be.equal(false)
          this.errors.should.be.eql({enum_attribute: [ 'only allow one of [foo_changed, bar_changed]' ]})
          next()
        })
      })
    })


    it('composite type is defined', function(next){
      store2.ready(function(){
        const AttributeTest = store2.Model('attribute_test')
        const test = AttributeTest.new({composite_attribute: {foo_changed: 7, bar_changed: 7}})
        test.composite_attribute.foo_changed.should.be.equal(7)
        test.composite_attribute.bar_changed.should.be.equal('7') // auto convert to string
        next()
      })
    })
  })
})
