var should = require('should')
var path = require('path')

var Store = require('../lib/store')

describe('Store: Base', function() {
  it('is a function', function() {
    Store.should.be.a.Function()
  })

  it('throws an error on unknown type', function() {
    ;(function() {
      new Store({ type: 'unknown' }) // eslint-disable-line
    }.should.throw())
  })

  describe('without config', function() {
    var store = new Store()

    it('has the base definition loaded', function() {
      store.type.should.be.equal('base')
    })
  })

  describe('Model()', function() {
    describe('without params', function() {
      var store = new Store()

      store.Model('User', function() {})

      it('returns the model', function() {
        return store.ready(function() {
          var User = store.Model('User')
          should.exist(User)
        })
      })
    })

    describe('without call of done', function() {
      var store = new Store()

      store.Model('User', function() {})

      it('returns the model', function() {
        return store.ready(function() {
          var User = store.Model('User')
          should.exist(User)
        })
      })
    })

    describe('without global on', function() {
      /* global User */
      var store = new Store({
        global: true
      })

      store.Model('User', function() {})

      it('creates global models', function() {
        return store.ready(function() {
          should.exist(User)
        })
      })
    })
  })

  describe('ready()', function() {
    var store = new Store()

    store.Model('User', function() {})

    store.Model('Post', function() {
      return new Promise(function(resolve) {
        setTimeout(resolve, 30)
      })
    })

    it('will be called after all models are ready', function() {
      return store
        .ready(function() {
          should.exist(store.Model('User'))
          should.exist(store.Model('Post'))
          return 'finished'
        })
        .should.be.fulfilledWith('finished')
    })
  })

  describe('ready() with more models', function() {
    it('will be called after all models are ready', function() {
      var store = new Store()

      store.Model('A', function() {})

      store.Model('B', function() {
        return new Promise(function(resolve) {
          setTimeout(resolve, 1)
        })
      })

      store.Model('C', function() {
        return new Promise(function(resolve) {
          setTimeout(resolve, 5)
        })
      })

      store.Model('D', function() {
        return new Promise(function(resolve) {
          setTimeout(resolve, 10)
        })
      })

      store.Model('E', function() {
        return new Promise(function(resolve) {
          setTimeout(resolve, 7)
        })
      })

      store.Model('F', function() {
        return new Promise(function(resolve) {
          setTimeout(resolve, 5)
        })
      })

      return store.ready(function() {
        should.exist(store.Model('A'))
        should.exist(store.Model('B'))
        should.exist(store.Model('C'))
        should.exist(store.Model('D'))
        should.exist(store.Model('E'))
        should.exist(store.Model('F'))
      })
    })
  })

  describe('ready() with any models', function() {
    var store = new Store()

    it('will be called after all models are ready', function() {
      return store
        .ready(function() {
          return 'finished'
        })
        .should.be.fulfilledWith('finished')
    })
  })

  describe('loads models via models:"path/*" config (+ plugin)', function() {
    var store = new Store({
      models: path.join(__dirname, 'fixtures', 'models', '*.js'),
      plugins: [require('../lib/base/dynamic_loading')]
    })

    it('models are loaded', function() {
      return store.ready(function() {
        should.exist(store.Model('User'))
        should.exist(store.Model('CamelCasedModel'))
      })
    })

    it('throws an error if the plugin is not used', function() {
      should.throws(function() {
        const store = new Store({
          // eslint-disable-line no-unused-vars
          models: path.join(__dirname, 'fixtures', 'models', '*.js')
        })
      })
    })
  })

  describe('loads models via models:"path/*" config (+ plugin) and uses the function name instead of filename', function() {
    var store = new Store({
      models: path.join(__dirname, 'fixtures', 'models', '*.js'),
      plugins: [require('../lib/base/dynamic_loading')]
    })

    it('models are loaded', function() {
      return store.ready(function() {
        should.exist(store.Model('RightName'))
      })
    })

    it('model has loaded required plugins (attributes)', function() {
      return store.ready(function() {
        should.exist(store.Model('User').definition.attributes.login)
      })
    })

    it('model has loaded required plugins (model methods)', function() {
      return store.ready(function() {
        should.exist(store.Model('User').foobar)
        store
          .Model('User')
          .foobar()
          .should.be.equal('foo')
      })
    })
  })

  describe('loads models via require (array)', function() {
    var store = new Store({
      models: [
        require('./fixtures/models/camel_cased_model'),
        require('./fixtures/models/other_name'),
        require('./fixtures/models/user')
      ]
    })

    it('only one model is loaded', function() {
      return store.ready(function() {
        should.exist(store.Model('RightName'))
        store.models.should.not.have.key('user')
      })
    })
  })

  describe('loads models via require (object)', function() {
    var store = new Store({
      models: {
        CamelCasedModel: require('./fixtures/models/camel_cased_model'),
        OtherName: require('./fixtures/models/other_name'),
        User: require('./fixtures/models/user')
      }
    })

    it('models are loaded', function() {
      return store.ready(function() {
        should.exist(store.Model('RightName'))
        should.exist(store.Model('User'))
        should.exist(store.Model('RightName'))
      })
    })

    it('model has loaded required plugins (attributes)', function() {
      return store.ready(function() {
        should.exist(store.Model('User').definition.attributes.login)
      })
    })

    it('model has loaded required plugins (model methods)', function() {
      return store.ready(function() {
        should.exist(store.Model('User').foobar)
        store
          .Model('User')
          .foobar()
          .should.be.equal('foo')
      })
    })
  })

  describe('loads plugins ', function() {
    var store = new Store({
      plugins: require(path.join(
        __dirname,
        'fixtures',
        'plugins',
        'test-plugin.js'
      ))
    })

    it('plugins are loaded on the store', function() {
      store.myStoreFunction.should.be.a.Function()
    })

    it('plugins are loaded on the store', function() {
      store.Model('test', function() {
        this.myDefinitionFunction.should.be.a.Function()
      })
    })
  })

  describe('plugin overrides method', function() {
    var store = new Store({
      plugins: [
        require(path.join(__dirname, 'fixtures', 'plugins', 'test-plugin.js'))
      ]
    })

    it('calls parent()', function() {
      store.Model('A', 'B', function() {
        this.attribute('test', String)
      })

      return store.ready(function() {
        var AB = store.Model('A', 'B')
        AB.definition.attributes.should.have.property('test')
      })
    })
  })

  describe('has a name', function() {
    it('which was configured', function() {
      var store = new Store({
        name: 'foo'
      })

      store.name.should.be.equal('foo')
    })

    it('which was auto-configured', function() {
      var store = new Store({})

      store.name.should.startWith('store')
    })

    it('which was auto-configured and should be unique', function() {
      var store1 = new Store({})
      var store2 = new Store({})

      store1.name.should.startWith('store')
      store2.name.should.startWith('store')
      store2.name.should.not.be.equal(store1)
    })
  })
})
