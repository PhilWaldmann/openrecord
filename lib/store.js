const events = require('events')
const util = require('util')
const path = require('path')

const Utils = require('./utils')
const Definition = require('./definition')

var pseudoLogger = {
  trace: process.env.TRACE ? console.trace : function(){},
  info: process.env.DEBUG ? console.info : function(){},
  warn: console.warn,
  error: console.error
}

var GLOBAL_STORES = {}
var STORE_COUNTER = 0
var STORE_WAIT = {}



const Promise = require('bluebird')

Promise.onPossiblyUnhandledRejection(function(error){
  console.log('onPossiblyUnhandledRejection >', error)
})


var Store = function(config){
  STORE_COUNTER++

  config = config || {}

  if(config.debug){
    process.env.DEBUG = true
    pseudoLogger.info = console.info
  }

  this.definitions = {}
  this.models = {}
  this.config = config
  this.global = config.global || false
  this.type = config.type || 'base'
  this.logger = config.logger || pseudoLogger
  this.cache = config.cache || {}
  this.name = config.name || 'store' + STORE_COUNTER
  this.throw = config.throw_errors !== undefined ? config.throw_errors : process.env.NODE_ENV === 'test'

  this.models_initializer = null
  this.middleware = []

  this.utils = Utils.clone(Utils)

  Store.registerStore(this)


  events.EventEmitter.call(this)
  this.setMaxListeners(0)

  if(!Store.registeredTypes[this.type]){
    throw new Store.UnknownStoreTypeError(this.type)
  }

  this.mixinPaths = Store.registeredTypes[this.type]

  if(config.plugins) this.mixinPaths = this.mixinPaths.concat(config.plugins)

  this.utils.mixin(this.utils, this.mixinPaths, {only: 'utils'})
  this.utils.mixin(this, this.mixinPaths, {only: 'store'})

  this.utils.mixinCallbacks(this, config)
  if(config.models){
    this.loadModels(config.models)
  }
}

util.inherits(Store, events.EventEmitter)

Store.registeredTypes = {}



Store.prototype.Model = function(name, fn){
  var modelName = this.utils.getModelName(name).toLowerCase()

  if(!fn){
    return this.models[modelName]
  }

  var self = this
  var definition = this.definitions[modelName] || new Definition(this, name)

  if(!this.definitions[modelName]){
    definition.include(this.mixinPaths)
    this.definitions[modelName] = definition
  }

  definition.use(fn)

  this.models_initializer = null // reset store promise


  this.use(function(){
    return definition.define()
    .then(function(result){
      const Model = result.Model
      self.models[modelName] = Model

      if(self.global){
        if(self.config.global_prefix){
          global[self.config.global_prefix + name] = Model
        }else{
          global[name] = Model
        }
      }

      // emit `model_created` and `<model-name>_created` events
      self.emit('model_created', Model)
      self.emit(modelName + '_created', Model)
    })
  }, 50)
}



Store.prototype.loadModels = function(modules){
  var models = this.utils.getModules(modules)

  for(var fullpath in models){
    if(models.hasOwnProperty(fullpath) && typeof models[fullpath] === 'function'){
      var modelName = models[fullpath].name || this.utils.getModelName(path.basename(fullpath, path.extname(fullpath)))
      // TODO: returns a Promise - we need to fix this!
      this.Model(modelName, models[fullpath])
    }
  }
}



Store.prototype.use = function(fn, priority){
  var self = this

  priority = priority || 0

  var middlewareFn = function(){
    return fn.call(self, self)
  }

  middlewareFn.priority = priority

  this.middleware.push(middlewareFn)
}



Store.prototype.ready = function(next){
  var self = this
  if(this.models_initializer){
    return this.models_initializer.then(next)
  }

  // sort middleware by priority
  this.middleware.sort(function(a, b){
    return a.priority < b.priority
  })

  this.models_initializer = this.utils.series(this.middleware)
  .then(function(){
    // if we got additonal middleware (migration seed)
    return self.utils.series(self.middleware)
  })
  .then(function(){
    self.middleware = [] // final reset
  })

  self.middleware = [] // reset middleware to get additional middleware (e.g. migration seed)

  return this.models_initializer
  .then(next)
}



Store.getStoreByName = function(name){
  return GLOBAL_STORES[name]
}

Store.waitForStore = function(name, callback){
  STORE_WAIT[name] = STORE_WAIT[name] || []
  STORE_WAIT[name].push(callback)
}


Store.registerStore = function(store){
  var name = store.name

  GLOBAL_STORES[name] = store

  if(STORE_WAIT[name]){
    for(var i = 0; i < STORE_WAIT[name].length; i++){
      STORE_WAIT[name][i](store)
    }
    STORE_WAIT[name] = null
  }
}

Store.unregisterStore = function(store){
  delete GLOBAL_STORES[store.name]
}







Store.addExceptionType = function(cls, isErrorClass){
  if(typeof cls === 'function' && typeof cls.name === 'string'){
    if(!Store[cls.name]){
      Store[cls.name] = cls
      Store.prototype[cls.name] = cls

      if(isErrorClass) return

      if(!cls.captureStackTrace){
        util.inherits(cls, Error)
      }

      cls.prototype.name = cls.name
    }
  }
}

Store.addExceptionType(function UnknownStoreTypeError(type){
  Error.call(this)
  this.message = 'Unknown connection type "' + type + '"'
})



module.exports = Store
