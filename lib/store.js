const events = require('events')
const util = require('util')
const path = require('path')

const Utils = require('./utils')
const Definition = require('./definition')

var GLOBAL_STORES = {}
var STORE_COUNTER = 0

var Store = function(config) {
  STORE_COUNTER++

  config = config || {}

  this.definitions = {}
  this.models = {}
  this.config = config
  this.global = config.global || false
  this.type = config.type || 'base'
  this.cache = config.cache || {}
  this.name = config.name || 'store' + STORE_COUNTER

  this.modelsInitializer = null
  this.middleware = []

  this.utils = Utils.clone(Utils)

  Store.registerStore(this)

  events.EventEmitter.call(this)
  this.setMaxListeners(0)

  if (!Store.registeredTypes[this.type]) {
    throw new Store.UnknownStoreTypeError(this.type)
  }

  this.mixinPaths = Store.registeredTypes[this.type]

  if (config.plugins) this.mixinPaths = this.mixinPaths.concat(config.plugins)

  this.utils.mixin(this.utils, this.mixinPaths, { only: 'utils' })
  this.utils.mixin(this, this.mixinPaths, { only: 'store' })

  this.utils.mixinCallbacks(this, config)

  if (config.models) {
    this.loadModels(config.models)
  }
}

util.inherits(Store, events.EventEmitter)

Store.registeredTypes = {}

// The base Model for class inheritance
Store.BaseModel = Store.prototype.BaseModel = function() {
  this.setInternalValues()
  this.store.utils.mixinCallbacks(this, arguments, true)
}

Store.BaseModel.definition = Store.prototype.BaseModel.definition = function() {}

Store.prototype.Model = function(name, fn) {
  if (typeof name === 'function') {
    fn = name
    name = fn.name
  }

  var modelName = this.utils.getModelName(name).toLowerCase()

  if (!fn) {
    return this.models[modelName]
  }

  var self = this
  var definition = this.definitions[modelName] || new Definition(this, name)

  if (!this.definitions[modelName]) {
    definition.include(this.mixinPaths)
    this.definitions[modelName] = definition
  }

  if (fn.definition) {
    // a class
    definition.use(fn.definition)
    definition.model = fn
  } else {
    // simple function
    definition.use(fn)
  }

  this.modelsInitializer = null // reset store promise

  this.use(
    function() {
      return definition.define().then(function(result) {
        const Model = result.Model
        self.models[modelName] = Model

        if (self.global) {
          if (self.config.globalPrefix) {
            global[self.config.globalPrefix + name] = Model
          } else {
            global[name] = Model
          }
        }
      })
    },
    50,
    'Model: ' + modelName
  )
}

Store.prototype.loadModels = function(modules) {
  var models = this.utils.getModules(modules)

  for (var fullpath in models) {
    if (
      models.hasOwnProperty(fullpath) &&
      typeof models[fullpath] === 'function'
    ) {
      var modelName =
        models[fullpath].name ||
        this.utils.getModelName(path.basename(fullpath, path.extname(fullpath)))
      this.Model(modelName, models[fullpath])
    }
  }
}

Store.prototype.use = function(fn, priority, name) {
  var self = this

  priority = priority || 0

  var middlewareFn = function() {
    return fn.call(self, self)
  }

  middlewareFn.priority = priority
  middlewareFn.useName = name

  this.middleware.push(middlewareFn)
}

Store.prototype.ready = function(next) {
  var self = this
  if (this.modelsInitializer) {
    return this.modelsInitializer.then(next)
  }

  // sort middleware by priority
  this.middleware.sort(function(a, b) {
    if (a.priority < b.priority) return 1
    if (a.priority > b.priority) return -1
    return 0
  })

  this.modelsInitializer = this.utils
    .parallelWithPriority(this.middleware)
    .then(function() {
      // if we got additonal middleware (e.g. migration seed)
      return self.utils.parallelWithPriority(self.middleware)
    })
    .then(function() {
      self.middleware = [] // final reset
    })

  self.middleware = [] // reset middleware to get additional middleware (e.g. migration seed)

  return this.modelsInitializer.then(next)
}

Store.getStoreByName = function(name) {
  return GLOBAL_STORES[name]
}

Store.registerStore = function(store) {
  var name = store.name
  GLOBAL_STORES[name] = store
}

Store.unregisterStore = function(store) {
  delete GLOBAL_STORES[store.name]
}

Store.addExceptionType = function(cls, isErrorClass) {
  if (typeof cls === 'function' && typeof cls.name === 'string') {
    if (!Store[cls.name]) {
      Store[cls.name] = cls
      Store.prototype[cls.name] = cls

      if (isErrorClass) return

      if (!cls.captureStackTrace) {
        util.inherits(cls, Error)
      }

      cls.prototype.name = cls.name
    }
  }
}

Store.addExceptionType(function UnknownStoreTypeError(type) {
  Error.call(this)
  this.message = 'Unknown connection type "' + type + '"'
})

module.exports = Store
