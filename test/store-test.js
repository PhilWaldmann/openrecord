var should = require('should')
var path = require('path')

var Store = require('../lib/store')

describe('Store: Base', function(){
  describe('is a function', function(){
    Store.should.be.a.Function()
  })

  it('throws an error on unknown type', function(){
    (function(){
      new Store({type: 'unknown'}) // eslint-disable-line
    }).should.throw()
  })

  describe('without config', function(){
    var store = new Store()

    it('has the base definition loaded', function(){
      store.type.should.be.equal('base')
    })
  })

  describe('Model()', function(){
    describe('without params', function(){
      var store = new Store()

      store.Model('User', function(done){
        done()
      })


      it('returns the model', function(){
        var User = store.Model('User')
        should.exist(User)
      })
    })

    describe('without call of done', function(){
      var store = new Store()

      store.Model('User', function(){

      })

      it('returns the model', function(){
        var User = store.Model('User')
        should.exist(User)
      })
    })

    describe('without global on', function(){
      /* global User */
      var store = new Store({
        global: true
      })

      store.Model('User', function(done){
        done()
      })

      it('creates global models', function(){
        should.exist(User)
      })
    })
  })

  describe('ready()', function(){
    var store = new Store()

    store.Model('User', function(done){
      done()
    })

    store.Model('Post', function(done){
      setTimeout(done, 30)
    })

    it('will be called after all models are ready', function(done){
      store.ready(function(){
        should.exist(store.Model('User'))
        should.exist(store.Model('Post'))
        done()
      })
    })
  })



  describe('ready() with more models', function(){
    it('will be called after all models are ready', function(done){
      var store = new Store()

      store.Model('A', function(done){
        done()
      })

      store.Model('B', function(done){
        setTimeout(done, 1)
      })

      store.Model('C', function(done){
        setTimeout(done, 5)
      })

      store.Model('D', function(done){
        setTimeout(done, 10)
      })

      store.Model('E', function(done){
        setTimeout(done, 7)
      })

      store.Model('F', function(done){
        setTimeout(done, 5)
      })

      store.ready(function(){
        should.exist(store.Model('A'))
        should.exist(store.Model('B'))
        should.exist(store.Model('C'))
        should.exist(store.Model('D'))
        should.exist(store.Model('E'))
        should.exist(store.Model('F'))
        done()
      })
    })
  })



  describe('ready() with any models', function(){
    var store = new Store()

    it('will be called after all models are ready', function(done){
      store.ready(function(){
        done()
      })
    })
  })



  describe('loads models via models:"path/*" config', function(){
    var store = new Store({
      models: path.join(__dirname, 'fixtures', 'models', '*.js')
    })

    it('models are loaded', function(next){
      store.ready(function(){
        should.exist(store.Model('User'))
        should.exist(store.Model('CamelCasedModel'))
        next()
      })
    })
  })


  describe('loads models via models:"path/*" config and uses the function name instead of filename', function(){
    var store = new Store({
      models: path.join(__dirname, 'fixtures', 'models', '*.js')
    })

    it('models are loaded', function(next){
      store.ready(function(){
        should.exist(store.Model('RightName'))
        next()
      })
    })

    it('model has loaded required plugins (attributes)', function(next){
      store.ready(function(){
        should.exist(store.Model('User').definition.attributes.login)
        next()
      })
    })

    it('model has loaded required plugins (model methods)', function(next){
      store.ready(function(){
        should.exist(store.Model('User').foobar)
        store.Model('User').foobar().should.be.equal('foo')
        next()
      })
    })
  })



  describe('loads plugins via plugins:"path/*" config', function(){
    var store = new Store({
      plugins: path.join(__dirname, 'fixtures', 'plugins', '*.js')
    })

    it('plugins are loaded on the store', function(){
      store.myStoreFunction.should.be.a.Function()
    })

    it('plugins are loaded on the store', function(next){
      store.Model('test', function(){
        this.myDefinitionFunction.should.be.a.Function()
        next()
      })
    })
  })


  describe('plugin overrides method', function(){
    var store = new Store({
      plugins: path.join(__dirname, 'fixtures', 'plugins', '*.js')
    })

    it('calls parent()', function(next){
      store.Model('A', 'B', function(){
        this.attribute('test', String)
      })

      store.ready(function(){
        var AB = store.Model('A', 'B')
        AB.definition.attributes.should.have.property('test')
        next()
      })
    })
  })



  describe('has a name', function(){
    it('which was configured', function(){
      var store = new Store({
        name: 'foo'
      })

      store.name.should.be.equal('foo')
    })

    it('which was auto-configured', function(){
      var store = new Store({
      })

      store.name.should.startWith('store')
    })

    it('which was auto-configured and should be unique', function(){
      var store1 = new Store({})
      var store2 = new Store({})

      store1.name.should.startWith('store')
      store2.name.should.startWith('store')
      store2.name.should.not.be.equal(store1)
    })
  })
})
