const events = require('events')
const util = require('util')
const path = require('path')
const async = require('async')

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

  this.models_waiting = 0
  this.middleware = []

  this.async = async
  this.utils = Utils.clone(Utils)

  Store.registerStore(this)


  events.EventEmitter.call(this)
  this.setMaxListeners(0)

  if(!Store.registeredTypes[this.type]){
    throw new Store.UnknownStoreTypeError(this.type)
  }

  this.mixinPaths = Store.registeredTypes[this.type]

  if(config.plugins) this.mixinPaths = this.mixinPaths.concat(config.plugins)
  if(config.graphql) this.mixinPaths = this.mixinPaths.concat(require('./graphql'))

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
  if(!fn){
    return this.models[name.toLowerCase()]
  }

  if(this.models[name.toLowerCase()]){
    // extend the existing model
    this.models[name.toLowerCase()].definition.use(fn)
  }else{
    if(this.definitions[name.toLowerCase()]){
      this.definitions[name.toLowerCase()].use(fn)
      return
    }

    // create a new model
    this.models_waiting++

    var self = this
    var definition = new Definition(this, name)

    definition.include(this.mixinPaths)
    definition.use(fn)

    this.definitions[name.toLowerCase()] = definition
    process.nextTick(function(){
      definition.define(function(Model){
        self.models[name.toLowerCase()] = Model

        if(self.global){
          if(self.config.global_prefix){
            global[self.config.global_prefix + name] = Model
          }else{
            global[name] = Model
          }
        }


        // emit `model_created` and `<model-name>_created` events
        self.emit('model_created', Model)
        self.emit(name + '_created', Model)

        self.ready()
      })
    })
  }
}



Store.prototype.loadModels = function(modules){
  var models = this.utils.getModules(modules)

  for(var fullpath in models){
    if(models.hasOwnProperty(fullpath) && typeof models[fullpath] === 'function'){
      var modelName = models[fullpath].name || this.utils.getModelName(path.basename(fullpath, path.extname(fullpath)))

      this.Model(modelName, models[fullpath])
    }
  }
}



Store.prototype.use = function(fn){
  var self = this

  var middlewareFn = function(next){
    var done = function(){
      next(null)
    }

    fn.call(self, self, done)

    // call `done` if fn does not have any params
    if(fn.length < 2){
      done()
    }
  }

  this.middleware.push(middlewareFn)
}



Store.prototype.ready = function(fn){
  if(fn){
    if(this.models_waiting === 0){
      fn()
    }else{
      this.once('ready', fn)
    }
    return
  }

  this.models_waiting--

  if(this.models_waiting === 0){
    var self = this
    async.series(this.middleware, function(){
      self.emit('ready')
    })
  }
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







Store.addExceptionType = function(cls){
  if(typeof cls === 'function' && typeof cls.name === 'string'){
    if(!Store[cls.name]){
      if(!cls.captureStackTrace){
        util.inherits(cls, Error)
      }

      cls.prototype.name = cls.name

      Store[cls.name] = cls
    }
  }
}

Store.addExceptionType(function UnknownStoreTypeError(type){
  Error.call(this)
  this.message = 'Unknown connection type "' + type + '"'
})



module.exports = Store
