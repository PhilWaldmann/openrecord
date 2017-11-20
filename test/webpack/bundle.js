(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const events = __webpack_require__(5)
const util = __webpack_require__(6)
const path = __webpack_require__(7)
const async = __webpack_require__(1)

const Utils = __webpack_require__(12)
const Definition = __webpack_require__(13)

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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("async");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("validator");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("inflection");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("date-fns/parse");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("date-fns/format");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Store
try{
  Store = (function(path){
return function(config){
config.cache = {"user":{"attributes":[{"name":"id","type":"integer","options":{"description":null,"persistent":true,"primary":true,"notnull":false,"default":null,"writable":false},"validations":[]},{"name":"login","type":"string","options":{"description":null,"persistent":true,"primary":false,"notnull":false,"default":null,"writable":true},"validations":[]},{"name":"email","type":"string","options":{"description":null,"persistent":true,"primary":false,"notnull":false,"default":null,"writable":true},"validations":[]}]},"post":{"attributes":[{"name":"id","type":"integer","options":{"description":null,"persistent":true,"primary":true,"notnull":false,"default":null,"writable":false},"validations":[]},{"name":"user_id","type":"integer","options":{"description":null,"persistent":true,"primary":false,"notnull":false,"default":null,"writable":true},"validations":[]},{"name":"thread_id","type":"integer","options":{"description":null,"persistent":true,"primary":false,"notnull":false,"default":null,"writable":true},"validations":[]},{"name":"message","type":"string","options":{"description":null,"persistent":true,"primary":false,"notnull":false,"default":null,"writable":true},"validations":[]}]}};
return new __webpack_require__(path)(config)
}
})(10) // to simulate tests from the outside world
}catch(e){
  Store = __webpack_require__(11)
}

module.exports = function(database, diableautoload){
  const store = new Store({
    file: database,
    diableAutoload: diableautoload
  })

  store.Model('user', function(){})
  store.Model('post', function(){})

  return store
}


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("openrecord/store/sqlite3");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

const Store = __webpack_require__(0)

Store.registeredTypes.sqlite3 = __webpack_require__(14).concat(
  __webpack_require__(39),
  __webpack_require__(56),
  __webpack_require__(102)
)

module.exports = function(config){
  config.type = 'sqlite3'
  return new Store(config)
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

const inflection = __webpack_require__(3)


/**
 * Loops all properties of an object .
 * @method
 * @param {object} obj - The object to loop.
 * @param {function} fn - The function to call on every property.
 * @param {object} scope - The scope to call the function `fn`.
 */
exports.loopProperties = function(obj, fn, scope){
  scope = scope || this

  for(var name in obj){
    if(obj.hasOwnProperty(name)){
      fn.call(scope, name, obj[name])
    }
  }
}

exports.clone = function(obj){
  var tmp = obj

  if(!obj) return obj

  if(Array.isArray(obj)){
    tmp = []
    for(var i = 0; i < obj.length; i++){
      tmp.push(exports.clone(obj[i]))
    }
    return tmp
  }

  if(obj && typeof obj === 'object'){
    if(typeof obj.toJson === 'function'){
      return obj.toJson()
    }

    if(typeof obj.toJSON === 'function'){
      return obj.toJSON()
    }

    tmp = {}
    Object.keys(obj).forEach(function(name) {
      tmp[name] = exports.clone(obj[name])
    })
  }

  return tmp
}


exports.uniq = function(arr){
  var u = {}
  var a = []
  for(var i = 0, l = arr.length; i < l; ++i){
    if(u.hasOwnProperty(arr[i])) {
      continue
    }
    a.push(arr[i])
    u[arr[i]] = 1
  }
  return a
}



// e.g. models or migrations
exports.getModules = function(module){
  const self = this
  const modules = {}

  if(typeof module === 'function'){
    modules[module.name] = module
    return modules
  }

  if(typeof module === 'string'){
    return self.require(module, {includePathNames: true})
  }

  if(typeof module === 'object' && !Array.isArray(module)){
    return module
  }

  module.forEach(function(item){
    if(typeof item === 'string'){
      Object.assign(modules, self.require(module, {includePathNames: true}))
    }

    if(typeof item === 'function' && item.name){
      modules[item.name] = item
    }
  })

  return modules
}


exports.require = function(path){
  if(!Array.isArray(path)) path = [path]
  throw new Error('If you want to load models, migrations or plugins via paths, you need to require `openrecord/lib/base/dynamic_loading` as a plugin and install `glob`.\nLoading file "' + path[0] + '" failed!')
}


exports.mixin = function(target, _mixins, options){
  const self = this
  if(!options) options = {}
  if(!Array.isArray(_mixins)) _mixins = [_mixins]
  var mixins = []

  _mixins = _mixins.concat.apply([], _mixins) // flatten mixins

  _mixins.forEach(function(mixin){
    if(typeof mixin === 'string'){
      mixins = mixins.concat(self.require(mixin, options))
    }else{
      if(options.only) mixins.push(mixin[options.only])
      else mixins.push(mixin)
    }
  })

  for(var i in mixins){
    var mixin = mixins[i]

    exports.loopProperties(mixin, function(name, value){
      if(name === 'mixinCallback' && typeof value === 'function'){
        target.mixin_callbacks = target.mixin_callbacks || []
        target.mixin_callbacks.push(value)
      }else{
        // set parent
        if(typeof target[name] === 'function' && typeof value === 'function' && value !== target[name]){
          value._parent = target[name]
        }

        if(options.enumerable === false){
          Object.defineProperty(target, name, {
            enumerable: false,
            configurable: true,
            value: value
          })
        }else{
          target[name] = value
        }
      }
    })
  }
}

exports.mixinCallbacks = function(target, args, dontRemoveCallbacks){
  // call mixin constructors
  if(target.mixin_callbacks){
    for(var i in target.mixin_callbacks){
      target.mixin_callbacks[i].apply(target, args)
    }

    if(dontRemoveCallbacks !== true){
      delete target.mixin_callbacks
    }
  }
}


exports.args = function(args){
  return Array.prototype.slice.call(args)
}


exports.getModelName = function(name){
  return inflection.camelize(inflection.singularize(name))
}


exports.getStore = function(Store, name, _default, callback){
  if(!name) return callback(_default)
  if(Store.getStoreByName(name)) return callback(Store.getStoreByName(name))

  Store.waitForStore(name, callback)
}

exports.getModel = function(store, name, callback){
  if(typeof name !== 'string') return callback(name)

  name = exports.getModelName(name)

  var model = store.Model(name)
  if(model){
    callback(model)
  }else{
    store.once(name + '_created', function(model){
      callback(model)
    })
  }
}


exports.getRelation = function(definition, name, callback){
  if(typeof name !== 'string') return callback(name)

  var relation = definition.relations[name]
  if(relation){
    callback(relation)
  }else{
    definition.once(name + '_added', function(relation){
      callback(relation)
    })
  }
}


exports.addDefaults = function(original, defaults){
  if(!original || typeof original !== 'object') return
  if(!defaults || typeof defaults !== 'object') return

  exports.loopProperties(defaults, function(name, value){
    if(original[name] === undefined){
      original[name] = value
    }
  })
}


exports.addedArrayValues = function(original, changed){
  if(!changed) return []
  if(!original) return changed

  var tmp = []
  for (var i = 0; i < changed.length; i++) {
    if(original.indexOf(changed[i]) === -1){
      tmp.push(changed[i])
    }
  }
  return tmp
}


exports.removedArrayValues = function(original, changed){
  if(!original) return []
  if(!changed) return original
  return exports.addedArrayValues(changed, original)
}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__dirname) {const events = __webpack_require__(5)
const util = __webpack_require__(6)
const async = __webpack_require__(1)


/**
 * There are two ways to define a model.
 *
 * ```js
 * var store = new OpenRecord({
 *   //my store config
 * })
 *
 * store.model('MyModel', function(){
 *   //model definition scope
 * });
 * ```
 *
 * or via the `models` config option:
 *
 * ```js
 * var store = new OpenRecord({
 *   //my store config
 *   models: __dirname + '/models/*'
 * });
 * ```
 *
 * ```js
 * // ./models/mymodel.js
 * module.exports = function(){
 *   //model definition scope
 * };
 * ```
 *
 *
 * ## Model Definition Scope
 * The definition scope is like the Model class in ActiveRecord.
 * Here you'll define all your validations, relations, scopes, record helpers, hooks and more.
 *
 * ### Async
 * You could also define your model asynchronous
 * ```js
 * store.model('MyModel', function(next){
 *   //model definition scope
 *   next();
 * });
 * ```
 *
 * or via the `models` config option:
 *
 * ```js
 * // ./models/mymodel.js
 * module.exports = function(next){
 *   //model definition scope
 *   next();
 * };
 * ```
 *
 * @class Definition
 * @name Definition
 */







var Definition = function(store, modelName){
  this.store = store
  this.model_name = modelName
  this.model = null

  this.middleware = []

  this.instanceMethods = {}
  this.staticMethods = {}

  events.EventEmitter.call(this)
}

util.inherits(Definition, events.EventEmitter)



Definition.prototype.getName = function(){
  return this.model_name
}


Definition.prototype.getInstanceMethods = function(){
  return Object.create(this.instanceMethods)
}

Definition.prototype.getStaticMethods = function(){
  return Object.create(this.staticMethods)
}





Definition.prototype.include = function(mixins){
  // Mixins for this class
  this.store.utils.mixin(this, mixins, {only: 'definition', cwd: __dirname})

  // Mixins for the Model
  this.store.utils.mixin(this.staticMethods, mixins, {only: 'model', cwd: __dirname})
  // Mixins for the Model.prototype
  this.store.utils.mixin(this.instanceMethods, mixins, {only: 'record', cwd: __dirname})
}



Definition.prototype.use = function(fn, priority){
  var self = this

  if(self.model && self.model.finished){
    return fn.call(self) // enhancing a model is currently only possible in a synchronous fashion
  }

  priority = priority || 0

  var middlewareFn = function(next){
    var called = false
    var done = function(){
      if(called) return
      called = true
      next(null)
    }

    fn.call(self, done)

    // call `done` if fn does not have any params
    if(fn.length === 0){
      done()
    }
  }

  middlewareFn.priority = priority

  this.middleware.push(middlewareFn)
}


Definition.prototype.define = function(callback){
  var self = this

  this.store.utils.mixinCallbacks(this)

  // sort middleware by priority
  this.middleware.sort(function(a, b){
    return a.priority < b.priority
  })

  // and add the createModel middleware at the end
  this.middleware.push(this.createModel.bind(this))

  async.series(this.middleware, function(){
    delete self.model['building']
    self.model['finished'] = true

    self.emit('finished')
    callback(self.model)
  })
}





/*
 * MODEL CREATION MIDDLEWARE
 */

Definition.prototype.createModel = function(next){
  var self = this

  var Model = function(){
    this.setInternalValues()
    // events.EventEmitter.call(this);
    self.store.utils.mixinCallbacks(this, arguments, true)
  }

  Model['building'] = true

  Model.prototype = this.getInstanceMethods()
  Model.prototype.setInternalValues = function(){
    Object.defineProperty(this, 'definition', {enumerable: false, writable: true, value: self})
    Object.defineProperty(this, 'model', {enumerable: false, writable: false, value: Model})
  }

  var staticMethods = this.getStaticMethods()
  for(var key in staticMethods) {
    Model[key] = staticMethods[key]
  }

  Object.defineProperty(Model, 'definition', {enumerable: false, writable: false, value: self})


  this.model = Model

  next(null)
}


module.exports = Definition

/* WEBPACK VAR INJECTION */}.call(exports, "lib"))

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = [
  __webpack_require__(15),
  __webpack_require__(16),
  __webpack_require__(17),
  __webpack_require__(18),
  __webpack_require__(19),
  __webpack_require__(20),
  __webpack_require__(21),
  __webpack_require__(22),
  __webpack_require__(23),
  __webpack_require__(24),
  __webpack_require__(25),
  __webpack_require__(26),
  __webpack_require__(27),
  __webpack_require__(28),
  __webpack_require__(29),
  __webpack_require__(30),
  __webpack_require__(31),
  __webpack_require__(33),
  __webpack_require__(34),
  __webpack_require__(35),
  __webpack_require__(36),
  __webpack_require__(38)
]


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

exports.store = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    Store.addExceptionType(function UnknownAttribute(name){
      Error.apply(this)
      this.message = 'Unknown attribute "' + name + '"'
    })

    Store.addExceptionType(function UnknownAttributeTypeError(type){
      Error.apply(this)
      this.message = 'Unknown attribute type "' + type + '"'
    })
  }
}




/*
 * DEFINITION
 */
exports.definition = {

  mixinCallback: function(){
    this.attributes = {}
  },

  /**
   * Add a new attribute to your Model
   *
   * @class Definition
   * @method attribute
   * @param {string} name - The attribute name
   * @param {string} type - The attribute type (e.g. `text`, `integer`, or sql language specific. e.g. `blob`)
   * @param {object} options - Optional options
   *
   * @options
   * @param {boolean} writable - make it writeable (default: true)
   * @param {boolean} readable - make it readable (default: true)
   * @param {any} default - Default value
   * @param {boolean} emit_events - emit change events `name_changed` (default: false)
   *
   * @return {Definition}
   */
  attribute: function(name, type, options){
    options = options || {}
    type = type || String

    if(typeof type === 'string'){
      type = type.toLowerCase()
    }


    var fieldType = this.store.getType(type)
    if(!fieldType){
      return this.store.handleException(new this.store.UnknownAttributeTypeError(type))
    }

    this.store.utils.addDefaults(options, fieldType.defaults)


    options.type = fieldType
    options.writable = options.writable === undefined ? true : (!!options.writable)
    options.readable = options.readable === undefined ? true : (!!options.readable)
    options.track_object_changes = options.track_object_changes === undefined ? false : (!!options.track_object_changes)

    this.attributes[name] = options

    this.setter(name, options.setter || function(value){
      this.set(name, value)
    })

    if(options.readable){
      this.getter(name, function(){
        return this.get(name)
      })
    }

    return this
  },

  cast: function(attribute, value, castName, record){
    castName = castName || 'input'
    var attr = this.attributes[attribute]
    var cast = attr ? attr.type.cast[castName] : null
    var output = value

    if(attr && cast){
      if(Array.isArray(value) && !attr.type.array){
        output = []
        for(var i = 0; i < value.length; i++){
          output[i] = this.cast(attribute, value[i], castName, record)
        }
      }else{
        if(record) output = cast.call(record, value, attribute)
        else output = cast(value, attribute)
      }
    }

    return output
  },


  /**
   * Add a custom getter to your record
   *
   * @class Definition
   * @method getter
   * @param {string} name - The getter name
   * @param {function} fn - The method to call
   *
   * @return {Definition}
   */
  getter: function(name, fn){
    this.instanceMethods.__defineGetter__(name, fn)

    return this
  },


  /**
   * Add a custom setter to your record
   *
   * @class Definition
   * @method setter
   * @param {string} name - The setter name
   * @param {function} fn - The method to call
   *
   * @return {Definition}
   */
  setter: function(name, fn){
    this.instanceMethods.__defineSetter__(name, fn)

    return this
  },


  /**
   * Add a variant method to the specified attribute
   *
   * @class Definition
   * @method variant
   * @param {string} name - The attribute name
   * @param {function} fn - The method to call
   *
   * @return {Definition}
   */
  variant: function(name, fn){
    if(!this.attributes[name]) return this.store.handleException(new this.store.UnknownAttribute(name))

    this.attributes[name].variant = fn

    this[name + '$'] = function(args){
      return fn(this[name], args, this)
    }

    return this
  }
}





/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config, castType){
    this.relations = {}
    this.raw_relations = {}
    this.attributes = {}
    this.changes = {} // e.g. {login: ['phil', 'philipp']} first value is the original, second is the changed value
    this.object_changes = {}

    if(config){
      this.set(config || {}, castType)
    }
  },


  /**
   * Set one or multiple attributes of a Record.
   *
   * @class Record
   * @method set
   * @param {string} name - The attributes name
   * @param {VALUE} value - The attributes value
   * @or
   * @param {object} attributes - Multiple attribute as an object
   * @param {string} cast_type - Optional cast_type name (Default: `input`)
   *
   * @return {Record}
   */
  set: function(name, value){
    var values = name
    var castType = value
    var singleAssign = false
    if(typeof name === 'string'){
      values = {}
      values[name] = value
      castType = 'input'
      singleAssign = true
    }

    for(var field in this.definition.attributes){
      if(this.definition.attributes.hasOwnProperty(field)){
        if(singleAssign && values[field] === undefined){
          continue
        }


        var definition = this.definition.attributes[field]
        value = values[field]


        if(!singleAssign && value && typeof definition.setter === 'function'){
          definition.setter.call(this, value)
          continue
        }

        if(value === undefined && this.attributes[field] === undefined && definition.default !== undefined){
          value = this.definition.store.utils.clone(definition.default)
        }

        if(value === undefined && this.attributes[field] !== undefined){
          value = this.attributes[field]
        }

        if(value === undefined){
          value = null
        }


        // typecasted value
        castType = castType || 'input'

        if(!definition.type.cast[castType]){
          castType = 'input'
        }

        value = value !== null ? this.definition.cast(field, value, castType, this) : null

        if(this.attributes[field] !== value){
          if(value && typeof value === 'object'){
            // automatically set object tracking to true if the value is still an object after the casting
            definition.track_object_changes = true
          }

          if(definition.writable && !(value === null && this.attributes[field] === undefined)){
            var beforeValue = this[field]
            var afterValue = value

            if(this.changes[field]){
              this.changes[field][1] = afterValue
            }else{
              this.changes[field] = [beforeValue, afterValue]
            }
          }

          if(definition.track_object_changes && (this.object_changes[field] === undefined || castType !== 'input')){
            // initial object hash
            this.object_changes[field] = [this.objectHash(value), JSON.stringify(value)]
          }

          this.attributes[field] = value

          if(definition.emit_events && beforeValue !== value){
            // emit old_value, new_value
            this.definition.emit(field + '_changed', this, beforeValue, value)
          }
        }
      }
    }

    return this
  },

  /**
   * Get an attributes.
   *
   * @class Record
   * @method get
   * @param {string} name - The attributes name
   *
   * @return {VALUE}
   */
  get: function(name){
    var attr = this.definition.attributes[name]

    if(attr){
      // set undefined values to null
      if(this.attributes[name] === undefined){
        this.attributes[name] = null
      }

      return this.definition.cast(name, this.attributes[name], 'output', this)
    }

    return null
  },


  /**
   * Returns `true` if there are any changed values in that record
   *
   * @class Record
   * @method hasChanges
   *
   * @return {boolean}
   */
  hasChanges: function(){
    this.checkObjectChanges()
    return Object.keys(this.getChanges()).length > 0
  },

  /**
   * Returns `true` if the given attributes has changed
   *
   * @class Record
   * @method hasChanged
   * @param {string} name - The attributes name
   *
   * @return {boolean}
   */
  hasChanged: function(name){
    return Object.keys(this.getChanges()).indexOf(name) !== -1
  },

  /**
   * Returns an object with all the changes. One attribute will always include the original and current value
   *
   * @class Record
   * @method getChanges
   *
   * @return {object}
   */
  getChanges: function(){
    this.checkObjectChanges()
    var tmp = {}
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        if(!this.allowed_attributes || (this.allowed_attributes && this.allowed_attributes.indexOf(name) !== -1)) { tmp[name] = this.changes[name] }
      }
    }
    return tmp
  },

  /**
   * Returns an object with all changed values
   *
   * @class Record
   * @method getChangedValues
   *
   * @return {object}
   */
  getChangedValues: function(){
    this.checkObjectChanges()
    var tmp = {}
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        if(!this.allowed_attributes || (this.allowed_attributes && this.allowed_attributes.indexOf(name) !== -1)) { tmp[name] = this.changes[name][1] }
      }
    }
    return tmp
  },

  /**
   * Resets all changes to the original values
   *
   * @class Record
   * @method resetChanges
   *
   * @return {Record}
   */
  resetChanges: function(){
    // TODO: reset object changes
    for(var name in this.changes){
      if(this.changes.hasOwnProperty(name)){
        this[name] = this.changes[name][0]
      }
    }

    this.changes = {}
    return this
  },



  checkObjectChanges: function(){
    for(var field in this.object_changes){
      if(this.object_changes.hasOwnProperty(field)){
        if(this.attributes[field]){
          var hash = this.objectHash(this.attributes[field])
          if(hash !== this.object_changes[field][0] && !this.changes[field]){
            this.changes[field] = [JSON.parse(this.object_changes[field][1]), this.attributes[field]]
          }
        }
      }
    }
  },


  objectHash: function(obj){
    if(!obj) return null
    return JSON.stringify(obj)
    .split('')
    .reduce(function(a, b){
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
  }

}


/***/ }),
/* 16 */
/***/ (function(module, exports) {

exports.definition = {
  mixinCallback: function(){
    var self = this
    self.ChainGenerator = null

    this.on('finished', function(){
      var Chain = function(){}
      Chain.prototype = []

      // Array.find() interference with our own find method - when called via callParent()
      // so, the current solution is to null it!
      Chain.prototype.find = null

      var ChainModelMethods = {
        setInternal: function(name, value){
          this._internal_attributes[name] = value
        },

        getInternal: function(name){
          return this._internal_attributes[name]
        },

        clearInternal: function(name){
          this._internal_attributes[name] = null
        },

        addInternal: function(name, value){
          this._internal_attributes[name] = this._internal_attributes[name] || []
          if(Array.isArray(value)){
            this._internal_attributes[name] = this._internal_attributes[name].concat(value)
          }else{
            this._internal_attributes[name].push(value)
          }
        },

        definition: self,
        model: self.model,
        chained: true
      }


      self.store.utils.mixin(Chain.prototype, ChainModelMethods, {enumerable: false})
      self.store.utils.mixin(Chain.prototype, self.model, {enumerable: false})
      self.store.utils.mixin(Chain.prototype, self.store.mixinPaths, {only: 'chain', enumerable: false})


      self.ChainGenerator = function(options){
        var arr = []
        Object.setPrototypeOf(arr, Chain.prototype)
        arr.options = options || {}
        arr._internal_attributes = {}

        self.store.utils.mixinCallbacks(arr)

        return arr
      }
    })
  }
}

/*
 * MODEL
 */
exports.model = {
  /**
   * Returns a Collection, which is in fact a cloned Model - or a chained Model
   * A Collectioin is an Array with all of Models' methods. All `where`, `limit`, `setContext`, ... information will be stored in this chained Model to allow asynchronous usage.
   *
   * @class Model
   * @method chain
   * @param {object} options - The options hash
   * @param {boolean} options.clone - Clone a existing chained object. Default: false
   *
   * @return {Collection}
   */
  chain: function(options){
    options = options || {}
    if(this.chained && options.clone !== true) return this

    var ChainModel = new this.definition.ChainGenerator(options)

    if(this.chained && options.clone === true){
      ChainModel._internal_attributes = this.definition.store.utils.clone(this._internal_attributes)
    }

    return ChainModel.callDefaultScopes()
  },


  /**
   * Returns a cloned Collection
   *
   * @class Model
   * @method clone
   *
   * @return {Collection}
   */
  clone: function(){
    return this.chain({clone: true})
  }
}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)

/*
 * MODEL
 */
exports.model = {
  /**
   * Initialize a new Record.
   * You could either use
   * ```js
   * var records = new Model();
   * ```
   * @or
   * ```js
   * var records = Model.new();
   * ```
   *
   * @class Model
   * @method new
   * @param {object} attributes - Optional: The records attributes
   *
   * @return {Record}
   */
  'new': function(data, castType){
    data = data || {}

    // if it's already a record
    if(data.definition && data._exists){
      this.add(data)
      return data
    }

    if(this.chained){
      var record = this.model.new()
      if(this.definition.temporary){
        record.definition = this.definition
      }

      record.__chained_model = this
      record.set(data, castType)

      this.add(record)

      return record
    }

    return new this(data, castType)
  }
}





/*
 * CHAIN
 */
exports.chain = {

  /**
   * Loops all the Records in the Collection
   *
   * @class Collection
   * @method each
   * @param {function} callback - The method to be called for every record
   * @param {function} done - This method will be called at the end (Optional)
   *
   * @callback
   * @param {Record} record - The current record
   * @param {Number} index - The current index
   * @param {Function} next - if given, the each method will behave async. Call next() to get the next record
   * @this Collection
   *
   * @return {Collection}
   */
  each: function(callback, done){
    var i
    if(callback.length <= 2){
      for(i = 0; i < this.length; i++){
        callback.call(this, this[i], i)
      }
      if(typeof done === 'function') done.call(this)
    }else{
      var self = this
      var tmp = []
      var len = this.length

      for(i = 0; i < this.length; i++){
        (function(record, index){
          tmp.push(function(next){
            if(len > 200){
              callback.call(self, record, index, function(err, result){
                async.setImmediate(function() {
                  next(err, result)
                })
              })
            }else{
              callback.call(self, record, index, next)
            }
          })
        })(this[i], i)
      }

      if(tmp.length === 0){
        if(typeof done === 'function') done.call(self)
        return
      }

      async.series(tmp, function(){
        if(typeof done === 'function') done.call(self)
      })
    }

    return this
  },

  /**
   * Adds new Records to the collection
   *
   * @class Collection
   * @method add
   * @param {array} Record - Either an object which will be transformed into a new Record, or an existing Record
   *
   * @return {Collection}
   */
  add: function(records){
    var self = this.chain()
    var relation = self.getInternal('relation')
    var parentRecord = self.getInternal('relation_to')

    if(!Array.isArray(records)) records = [records]

    for(var i = 0; i < records.length; i++){
      var record = records[i]
      if(record && typeof record === 'object'){
        if(self.options.polymorph){
          if(!(record instanceof record.model)) continue
        }else{
          if(!(record instanceof self.model)) record = self.model.new(record)
        }

        self.push(record)

        if(relation && parentRecord){
          self.definition.emit('relation_record_added', parentRecord, relation, record)
        }
      }
    }

    return self
  },

  /**
   * Removes a Record from the Collection
   *
   * @class Collection
   * @method remove
   * @param {integer} index - Removes the Record on the given index
   * @or
   * @param {Record} record - Removes given Record from the Collection
   *
   * @return {Collection}
   */
  remove: function(index){
    var self = this.chain()

    if(typeof index !== 'number'){
      index = self.indexOf(index)
    }

    self.splice(index, 1)

    return self
  },


  /**
   * Returns the first Record in the Collection
   *
   * @class Collection
   * @method first
   *
   * @return {Record}
   */
  first: function(){
    return this[0]
  },

  /**
   * Returns the last Record in the Collection
   *
   * @class Collection
   * @method last
   *
   * @return {Record}
   */
  last: function(){
    return this[this.length - 1]
  },


  /**
   * Creates a temporary definition object, that lives only in the current collection.
   * This is usefull if you need special converters that's only active in a certain scope.
   *
   * @class Collection
   * @method temporaryDefinition
    * @param {function} fn - Optional function with the definition scope
   *
   * @return {Definition}
   */
  __temporary_definition_attributes: ['attributes', 'interceptors', 'relations', 'validations'],

  temporaryDefinition: function(fn){
    var tmp = {temporary: true}

    if(this.definition.temporary){
      return this.definition
    }

    for(var name in this.definition){
      var prop = this.definition[name]

      if(this.__temporary_definition_attributes.indexOf(name) !== -1){
        tmp[name] = this.definition.store.utils.clone(prop)
        continue
      }

      tmp[name] = prop
    }

    Object.defineProperty(this, 'definition', {
      enumerable: false,
      value: tmp
    })

    if(typeof fn === 'function'){
      fn.call(this.definition)
    }

    return this.definition
  }
}


/***/ }),
/* 18 */
/***/ (function(module, exports) {


/*
 * MODEL
 */
exports.model = {
  /**
   * Adds a context object to your Model which could be used by your Hooks, Validation or Events via `this.context`
   * This is especially usefull need to differentiate things based on e.g. the cookie. Just set the context to the current request (`Model.setContext(req).create(params))` and use `this.context` inside your `beforeCreate()` hook.
   * The `context` Variable is available on your Model an all it's Records.
   *
   * @class Model
   * @method setContext
   * @param {object} context - Your context object
   *
   * @return {Model}
   */
  setContext: function(context){
    var self = this.chain()

    self.setInternal('context', context)

    self.callInterceptors('onContext', [context], function(okay){
      // we use interceptors here even though there isn't anything to intercept...
    })

    return self
  }
}


/*
 * CHAIN
 */
exports.chain = {
  mixinCallback: function(){
    this.__defineGetter__('context', function(){
      return this.getInternal('context')
    })
  }
}


/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(){
    this.__defineGetter__('context', function(){
      return this.__context || (this.__chained_model ? this.__chained_model.getInternal('context') : {})
    })
  }
}


exports.definition = {
  mixinCallback: function(){
    this.on('relation_record_added', function(parent, options, record){
      record.__defineGetter__('__context', function(){
        return parent.context
      })
    })
  }
}


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

exports.store = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    Store.addExceptionType(function MissingConvertFunction(attr){
      Error.apply(this)
      this.message = 'Missing convert function for "' + attr + '"'
    })

    Store.addExceptionType(function UnknownConvertAttribute(attr){
      Error.apply(this)
      this.message = 'Unknown attribute "' + attr + '"'
    })
  }
}



exports.definition = {

  convert: function(type, attribute, fn, forceType){
    var self = this
    var attr = this.attributes[attribute]

    if(!fn) throw new this.store.MissingConvertFunction(attribute)

    if(attr){
      // Clone the type object, because it's shared across all attributes with the same type
      attr.type = self.store.utils.clone(attr.type)

      var originalCast = attr.type.cast[type]

      if(typeof originalCast === 'function'){
        attr.type.cast[type] = function(value){
          if(forceType !== false){
            value = originalCast(value)
          }

          if(this instanceof self.model){
            value = fn.call(this, value)
            if(forceType !== false){
              value = originalCast(value)
            }
          }

          return value
        }
      }
    }else{
      throw new this.store.UnknownConvertAttribute(attribute)
    }

    return this
  },


  /**
   * add a special convert function to manipulate the input (e.g. via `set()`) value of an attribute
   *
   * @class Definition
   * @method convertInput
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   * @param {boolean} forceType - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertInput: function(attribute, fn, forceType){
    return this.convert('input', attribute, fn, forceType)
  },

  /**
   * add a special convert function to manipulate the output (`toJson()`) value of an attribute
   *
   * @class Definition
   * @method convertOutput
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   * @param {boolean} forceType - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertOutput: function(attribute, fn, forceType){
    return this.convert('output', attribute, fn, forceType)
  }

}


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

const validator = __webpack_require__(2)

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.attribute_types = {}

    this.addType(String, function(value){
      if(value === null) return null
      return validator.toString(value + '')
    })

    this.addType(Number, function(value){
      if(value === null) return null
      return validator.toFloat(value + '')
    })

    this.addType(Date, function(value){
      if(value === null) return null
      return validator.toDate(value + '')
    })

    this.addType(Boolean, function(value){
      if(value === null) return null
      return validator.toBoolean(value + '')
    })

    this.addType(Array, function(value){
      if(value === null) return null
      if(!Array.isArray(value)) return [value]
      return value
    })

    this.addType(Object, function(value){
      if(value === null) return null
      return value
    })

    this.addType(Buffer, {
      input: function(value){
        if(value === null) return null
        if(value instanceof String){
          if(Buffer.from) return Buffer.from(value, 'hex')
          return new Buffer(value, 'hex') // eslint-disable-line node/no-deprecated-api
        }

        if(Buffer.from) return Buffer.from(value, 'binary')
        return new Buffer(value, 'binary') // eslint-disable-line node/no-deprecated-api
      },
      output: function(value){
        if(value === null) return null
        return value.toString('hex')
      }
    })
  },

  addType: function(name, cast, options){
    options = options || {}

    if(!name) return this.handleException(new Error('No name given'))
    if(!cast) return this.handleException(new Error('No valid cast() method given'))

    if(typeof name === 'string') name = name.toLowerCase()
    if(typeof cast === 'function') cast = {input: cast, output: cast}

    if(options.extend){
      if(typeof options.extend === 'string') options.extend = options.extend.toLowerCase()

      if(this.attribute_types[options.extend]){
        var extend = this.attribute_types[options.extend].cast

        for(var n in extend){
          if(extend.hasOwnProperty(n) && !cast[n]){
            cast[n] = extend[n]
          }
        }
      }
    }

    if(!cast.input) return this.handleException(new Error('No intput cast() method given'))
    if(!cast.output) return this.handleException(new Error('No output cast() method given'))


    options.name = name
    options.cast = cast

    this.attribute_types[name] = options
  },


  getType: function(name){
    if(typeof name === 'string') name = name.toLowerCase()
    return this.attribute_types[name]
  }
}


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {


exports.store = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    Store.addExceptionType(function ReservedAttributeError(attr){
      Error.apply(this)
      this.message = 'Attribute "' + attr + '" is reserved'
    })
  }
}


/**
 * The error object on the Record is a simple Object with one method `add`
 * You could add validation errors to that object via
 * ```js
 *  this.errors.add('my_field', 'Some error');
 * ```
 *
 * which will result in the following error object
 * ```
 * {my_field: ['Some error']}
 * ```
 *
 * @class Record
 * @name The Error Object
 */

var ValidationError = function(){

}

ValidationError.prototype.add = function(name, message){
  const Store = __webpack_require__(0)
  if(!message){
    message = name
    name = 'base'
  }

  if(name === 'add') throw new Store.ReservedAttributeError('add')
  if(name === 'set') throw new Store.ReservedAttributeError('set')
  if(name === 'each') throw new Store.ReservedAttributeError('each')
  if(name === 'toJSON') throw new Store.ReservedAttributeError('toJSON')

  this[name] = this[name] || []
  this[name].push(message)
}

ValidationError.prototype.set = function(object){
  for(var name in object){
    if(object.hasOwnProperty(name)){
      this[name] = this[name] || []
      this[name].push(object[name])
    }
  }
}

ValidationError.prototype.each = function(callback){
  for(var name in this){
    if(this.hasOwnProperty(name) && Array.isArray(this[name])){
      for(var i = 0; i < this[name].length; i++){
        if(typeof callback === 'function') callback(name, this[name][i])
      }
    }
  }
}


ValidationError.prototype.toJSON = function(){
  var tmp = {}
  var hasErrors = false

  for(var name in this){
    if(this.hasOwnProperty(name) && typeof this[name] !== 'function' && containsErrors(this[name])){
      tmp[name] = this[name]
      hasErrors = true
    }
  }

  if(hasErrors) return tmp
}


ValidationError.prototype.toString = function(){
  var tmp = []
  var hasErrors = false

  for(var name in this){
    if(this.hasOwnProperty(name) && typeof this[name] !== 'function' && containsErrors(this[name])){
      tmp.push((name === 'base' ? '' : name + ': ') + this[name].join(', '))
      hasErrors = true
    }
  }

  if(hasErrors) return tmp.join('\n')
  return ''
}



function containsErrors(errors){
  if(typeof errors === 'string') return true

  for(var i = 0; i < errors.length; i++){
    if(typeof errors[i] === 'string') return true
    if(Array.isArray(errors[i]) && containsErrors(errors[i])) return true
    if(!Array.isArray(errors[i]) && typeof errors[i] === 'object'){
      for(var name in errors[i]){
        if(errors[i].hasOwnProperty(name)){
          if(containsErrors(errors[i][name])) return true
        }
      }
    }
  }

  return false
}




/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(){
    this.errors = this.errors || new ValidationError()
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    // Add a reference of the relation error object to itself
    this.on('relation_record_added', function(parent, options, record){
      // it's possible that a records gets relations added before it get it's error object assigned (see above)
      parent.errors = parent.errors || new ValidationError()
      record.errors = record.errors || new ValidationError()

      if(options.type === 'has_many' || options.type === 'belongs_to_many'){
        parent.errors[options.name] = parent.errors[options.name] || []
        parent.errors[options.name].push(record.errors)
      }else{
        parent.errors[options.name] = record.errors
      }
    })
  }
}


/***/ }),
/* 22 */
/***/ (function(module, exports) {

/*
 * CHAIN
 */
exports.chain = {
  mixinCallback: function(){
    /**
     * You could call `.every` on every Collection of records to get a special Record (PseudoRecord).
     * This PseudoRecord has all the properties and methods a normal Record of this Model has, but it will behave different
     * E.g. getting an attributes value `Collection.every.id` will return an array of all record's ids.
     * The same will work with setting an attribute or calling a method.
     *
     * @class Collection
     * @name .every
     *
     * @return {PseudoRecord}
     */

    // returns a pseudo record
    this.__defineGetter__('every', function(){
      var self = this
      var pseudo = new this.model() // eslint-disable-line

      for(var name in pseudo){
        (function(name, value){
          if(typeof value === 'function'){
            // replace methods
            pseudo[name] = function(){
              for(var i = 0; i < self.length; i++){
                var record = self[i]
                record[name].apply(record, arguments)
              }
            }
          }else{
            // replace attribute
            pseudo.__defineGetter__(name, function(){
              var tmp = []
              for(var i = 0; i < self.length; i++){
                var record = self[i]
                tmp.push(record[name])
              }
              return tmp
            })


            pseudo.__defineSetter__(name, function(value){
              for(var i = 0; i < self.length; i++){
                var record = self[i]
                record[name] = value
              }
            })
          }
        })(name, pseudo[name])
      }

      return pseudo
    })
  }
}


/***/ }),
/* 23 */
/***/ (function(module, exports) {

/*
 * STORE
 */
exports.store = {
  handleException: function(exception){
    if(this.throw) throw exception // throw errors

    if(this.listeners('exception').length > 0){
      this.emit('exception', exception)
    }else{
      if(this.logger.error){
        this.logger.error(exception.stack ? exception.stack : exception)
      }else{
        console.error('UNHANDLED ERROR:', exception.stack ? exception.stack : exception)
      }
    }
  }
}


/***/ }),
/* 24 */
/***/ (function(module, exports) {

/*
 * MODEL
 */
exports.model = {

  inspect: function(indent){
    if(!this.definition){
      return ''
    }

    indent = indent || 0
    var indentStr = ''
    var i

    for(i = 0; i < indent; i++){
      indentStr += ' '
    }

    if(this.chained){
      var tmp = '[\n'
      var records = []
      for(i = 0; i < this.length; i++){
        records.push(this[i].inspect(indent + 2))
      }
      if(records.length === 0){
        return '<' + this.definition.model_name + ' [empty result]>'
      }

      tmp += records.join(',\n')

      tmp += '\n' + indentStr + ']'

      return tmp
    }

    var attributes = []
    for(var name in this.definition.attributes){
      if(this.definition.attributes.hasOwnProperty(name)){
        attributes.push(name)
      }
    }

    return '<' + this.definition.model_name + ' [' + attributes.join(', ') + ']>'
  }

}

exports.record = {

  inspect: function(indent, nested){
    if(!this.model){
      return ''
    }

    indent = indent || 0

    var tmp = ''
    var indentStr = ''
    var name
    var i

    for(i = 0; i < indent; i++){
      indentStr += ' '
    }

    if(nested !== true) tmp += indentStr

    tmp += '<' + this.model.definition.model_name + ' {'

    var attributes = []
    for(name in this.attributes){
      if(this.attributes.hasOwnProperty(name) && this.definition.attributes[name] && this.definition.attributes[name].hidden !== true){
        var value = this.attributes[name]
        if(value && typeof value.inspect === 'function') value = value.inspect()
        else value = JSON.stringify(value)
        attributes.push(name + ':' + value)
      }
    }

    tmp += attributes.join(' ')

    var relations = []
    for(name in this.relations){
      if(this.relations.hasOwnProperty(name) && (this.relations[name])){
        if((this.definition.relations[name].type === 'has_many' || this.definition.relations[name].type === 'belongs_to_many') ? this.relations[name].length > 0 : true) {
          relations.push('\n  ' + indentStr + name + ': ' + this.relations[name].inspect(indent + 2, (this.definition.relations[name].type !== 'has_many' && this.definition.relations[name].type !== 'belongs_to_many')))
        }
      }
    }

    if(relations.length > 0){
      tmp += ','
    }
    tmp += relations.join(',')
    if(relations.length > 0){
      tmp += '\n' + indentStr
    }

    tmp += '}>'

    return tmp
  }

}


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)

exports.store = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    Store.addExceptionType(function UnknownInterceptorError(name){
      Error.apply(this)
      this.message = 'Can not find interceptor "' + name + '"'
    })

    Store.addExceptionType(function NoCallbackError(){
      Error.apply(this)
      this.message = 'No callback given'
    })
  }
}



/**
 * There are different phases for every process. Below are different hooks you could use to build your business logic
 * Every hook needs to return `true` or `false`. If you return `false` the whole process will be stopped.
 * You could use every hook synchronous or asynchronous.
 *
 * Synchronous: just return `true` or `false`
 * Asynchronous: put a `done` parameter into your callback and call `done()` when finished.
 *
 * @class Definition
 * @name Hooks / Interceptors
 */


/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.interceptors = []

    /**
     * Will be called before a validation. This hook will be called by `Record.save()`
     * @class Definition
     * @method beforeValidation
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeValidation')


    /**
     * Will be called after a validation. This hook will be called by `Record.save()`
     * @class Definition
     * @method afterValidation
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('afterValidation')


    /**
     * Will be called after a new context was set. This hook will be called by `Model.setContext()`.
     * @class Definition
     * @method onContext
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Object} context - The current context
     * @this Model
     *
     * @return {Definition}
     */
    this.addInterceptor('onContext')
  },

  addInterceptor: function(name){
    this.interceptors.push(name)
  }
}



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this
    var tmp = {}

    for(var i in this.store.interceptors){
      var name = this.store.interceptors[i]
      tmp[name] = [];
      (function(name){
        self[name] = function(callback, priority){
          this.addInterceptor(name, callback, priority)
          return self
        }
      })(name)
    }

    // Interceptor callback lists
    this.interceptors = tmp
  },


  addInterceptor: function(name, callback, priority){
    var self = this
    priority = priority || 0

    if(this.interceptors[name]){
      var fn = function(args, next){
        var callNext = false
        try{
          if(callback.length <= args.length){
            // via return;

            var result = callback.apply(this, args)

            if(result === false) result = 'false' // see async.applyEach below
            if(!(result instanceof Error) && result !== 'false') result = null

            callNext = true
            next(result)
          }else{
            // via next();
            callback.apply(this, args.concat(function(result){
              if(result === false) result = 'false' // see async.applyEach below
              if(!(result instanceof Error) && result !== 'false') result = null

              callNext = true
              next(result)
            }))
          }
        }catch(err){
          if(!callNext){
            return next(err)
          }else{
            self.store.handleException(err)
          }
        }
      }

      fn.priority = priority

      this.interceptors[name].push(fn)
    }else{
      throw new Error('Can not find interceptor ' + name)
    }
  },



  callInterceptors: function(name, scope, args, resolve, reject){
    const Store = __webpack_require__(0)
    if(typeof args === 'function'){
      reject = resolve
      resolve = args
      args = []
    }

    var store = this.store

    if(typeof reject !== 'function') reject = store.handleException.bind(store)
    if(!this.interceptors[name]) return reject(new Store.UnknownInterceptorError(name))
    if(typeof resolve !== 'function') return reject(new Store.NoCallbackError())

    var fns = []

    this.interceptors[name].sort(function(a, b){
      return a.priority < b.priority
    })

    for(var i in this.interceptors[name]){
      (function(interceptor){
        fns.push(function(next){
          interceptor.call(scope, args, next)
        })
      })(this.interceptors[name][i])
    }

    if(fns.length === 0){
      return resolve(true)
    }

    async.series(fns, function(err, result){
      if(err instanceof Error){
        reject(err)
      }else{
        // we need to provide a sting instead of a boolean value to make async.applyEach() work the way we want it.
        resolve(err !== 'false')
      }
    })
  }
}



/*
 * MODEL
 */
exports.model = {
  callInterceptors: function(name, args, resolve, reject){
    return this.definition.callInterceptors(name, this, args, resolve, reject)
  }
}


/*
 * RECORD
 */
exports.record = {
  callInterceptors: function(name, args, resolve, reject){
    return this.definition.callInterceptors(name, this, args, resolve, reject)
  }
}


/***/ }),
/* 26 */
/***/ (function(module, exports) {

exports.record = {
  /**
   * Returns an object which represent the record in plain json
   *
   * @class Record
   * @method toJson
   * @param {array} allowedAttributes - Optional: Only export the given attributes and/or relations
   * @param {object} exportObject - Optional: By default, OpenRecord clones the `attributes` object. If you specify the `exportObject` it will this instead.
   *
   * @return {object}
   */
  toJson: function(allowedAttributes, exportObject){
    var definition = this.definition
    var tmp = exportObject || definition.store.utils.clone(this.attributes)

    for(var i in definition.relations){
      var relation = definition.relations[i]
      if(this.relations && this.relations[relation.name]){
        tmp[relation.name] = this.relations[relation.name].toJson()
      }
    }

    if(!allowedAttributes && this.allowedAttributes) allowedAttributes = this.allowedAttributes

    for(var name in tmp){
      if(allowedAttributes && allowedAttributes.indexOf(name) === -1){
        delete tmp[name]
      }else{
        if(definition.attributes && definition.attributes[name] && definition.attributes[name].hidden !== true){
          tmp[name] = definition.cast(name, tmp[name], 'output', this)

          if(tmp[name] && typeof tmp[name].toJson === 'function') tmp[name] = tmp[name].toJson()
        }
      }
    }

    return tmp
  },

  // used by JSON.stringify
  toJSON: function(){
    return this.toJson()
  }
}


exports.chain = {
  /**
   * Returns an array of objects which represent the records in plain json
   *
   * @class Collection
   * @method toJson
   * @param {array} allowedAttributes - Optional: Only export the given attributes and/or relations
   *
   * @return {array}
   */
  toJson: function(allowedAttributes){
    var tmp = []
    this.each(function(record){
      tmp.push(record.toJson(allowedAttributes))
    })
    return tmp
  },

  // used by JSON.stringify
  toJSON: function(){
    return this.toJson()
  }
}


/***/ }),
/* 27 */
/***/ (function(module, exports) {

exports.definition = {
  mixinCallback: function(){
    this.__defineGetter__('logger', function(){
      return this.store.logger
    })
  }
}

exports.model = {
  mixinCallback: function(){
    this.__defineGetter__('logger', function(){
      return this.definition.store.logger
    })
  }
}

exports.record = {
  mixinCallback: function(){
    this.__defineGetter__('logger', function(){
      return this.model.definition.store.logger
    })
  }
}


/***/ }),
/* 28 */
/***/ (function(module, exports) {

/*
 * DEFINITION
 */
exports.definition = {

  /**
   * Adds a new method to the record
   *
   * @class Definition
   * @method method
   * @param {string} name - The name of the method
   * @param {function} callback - The function
   *
   * @return {Definition}
   */
  method: function(name, fn){
    this.instanceMethods[name] = fn

    return this
  },


  /**
   * Adds a new method to the class
   *
   * @class Definition
   * @method method
   * @param {string} name - The name of the method
   * @param {function} callback - The function
   *
   * @return {Definition}
   */
  staticMethod: function(name, fn){
    this.staticMethods[name] = fn

    return this
  }
}


/***/ }),
/* 29 */
/***/ (function(module, exports) {

exports.definition = {
  /**
   * Add custom methods to your Model`s Records
   * just define a function:
   * ```js
   *   this.function_name = function(){
   *     //this == Record
   *   };
   * ```
   * This will automatically add the new method to your Record
   *
   * @class Definition
   * @name Custom Record Methods
   *
   */
  mixinCallback: function(){
    var tmp = []
    var self = this

    this.use(function(){
      // get all current property names
      self.store.utils.loopProperties(this, function(name, value){
        tmp.push(name)
      })
    }, 90)


    this.on('finished', function(){
      // an now search for new ones == instance methods for our new model class

      self.store.utils.loopProperties(self, function(name, value){
        if(tmp.indexOf(name) === -1){
          self.instanceMethods[name] = value
          delete self[name]
        }
      })
    })
  }
}


/***/ }),
/* 30 */
/***/ (function(module, exports) {

exports.store = exports.definition = exports.model = exports.record = exports.utils = {
  callParent: function callParent(){
    var Utils = this // utils itself
    if(this.utils) Utils = this.utils // store
    if(this.store) Utils = this.store.utils // definition
    if(this.definition) Utils = this.definition.store.utils // record, model

    var parentFn = callParent.caller._parent
    if(typeof parentFn === 'function' && callParent.caller !== parentFn){
      return parentFn.apply(this, Utils.args(arguments))
    }
  }
}


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

const Promise = __webpack_require__(32)

exports.store = {
  mixinCallback: function(){
    var self = this
    Promise.onPossiblyUnhandledRejection(function(error){
      self.handleException(error)
    })
  }
}


exports.model = exports.record = {
  promise: function(resolver, resolve, reject){
    var promise = new Promise(resolver).bind(this)

    if(typeof resolve === 'function' && typeof reject !== 'function'){
      return promise.then(resolve)
    }

    if(typeof resolve === 'function' || typeof reject === 'function'){
      promise.then(resolve, reject)
    }

    return promise
  },


  catch: function(type, callback){
    return this.exec().catch(type, callback)
  },


  all: function(array){
    return Promise.all(array)
  }
}


/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = require("bluebird");

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

exports.store = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    Store.addExceptionType(function RelationNotFoundError(Model, relationName){
      Error.apply(this)
      this.message = "Can't find relation \"" + relationName + '" for ' + Model.definition.model_name
    })
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.relations = {}
  },


  relation: function(name, options){
    const Store = __webpack_require__(0)
    var self = this

    options = options || {}
    options.model = options.model || name
    options.name = name

    if(!name) throw new Error('no name given!')
    if(!options.model) throw new Error('no model given!')
    if(!options.type) throw new Error('no type given!')


    var gotModel = function(model){
      options.model = model

      self.relations[name] = options

      self.getter(name, options.getter || function(){
        // this.relations is the relations object of the record!
        return this.relations[name]
      })

      self.setter(name, options.setter)

      if(self.model && self.model.finished){
        self.emit('relation_added', options)
        self.emit(name + '_added', options)
      }else{
        self.once('finished', function(){
          self.emit('relation_added', options)
          self.emit(name + '_added', options)
        })
      }
    }

    const Utils = self.store.utils

    Utils.getStore(Store, options.store, self.store, function(store){
      if(options.through){
        Utils.getRelation(self, options.through, function(subRelation){
          options.relation = options.relation || options.name
          Utils.getRelation(subRelation.model.definition, options.relation, function(relation){
            options.polymorph = relation.polymorph === true
            gotModel(relation.model)
          })
        })
      }else{
        if(options.polymorph){
          gotModel(null)
        }else{
          Utils.getModel(store, options.model, gotModel)
        }
      }
    })



    return this
  },


  /**
   * Adds a has many relation to the current Model
   *
   * @class Definition
   * @method hasMany
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   *
   * @options
   * @param {string} model - The related model Name
   * @param {string} store - Optional store name for cross-store relations
   * @param {string} through - The through relation name
   * @param {string} relation - The target relation name (in conjunction with through)
   *
   * @return {Definition}
   */
  hasMany: function(name, options){
    options = options || {}
    options.type = 'has_many'

    options.getter = function(){
      if(!this.relations[name]){
        this[name] = null // creates a new chained model...
      }

      return this.relations[name]
    }

    options.setter = function(records){
      if(records === this.relations[name]){
        return
      }

      if(!this.relations[name]){
        if(!options.polymorph){
          this.relations[name] = options.model.chain()
        }else{
          this.relations[name] = this.model.chain({polymorph: true})
        }

        this.model.definition.emit('relation_initialized', this, options, this.relations[name])
      }

      this.relations[name].setInternal('relation_to', this)
      this.relations[name].setInternal('relation', options)

      if(!Array.isArray(records)) records = records ? [records] : []

      for(var i = 0; i < records.length; i++){
        if(records[i]){
          // add() calls emit('relation_record_added')
          this.relations[name].add(records[i])
        }
      }
    }

    return this.relation(name, options)
  },


  /**
   * Adds a belongs to relation to the current Model
   *
   * @class Definition
   * @method belongsTo
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   *
   * @options
   * @param {string} model - The related model Name
   * @param {string} store - Optional store name for cross-store relations
   * @param {string} through - The through relation name
   * @param {string} relation - The target relation name (in conjunction with through)
   * @param {boolean} polymorph - true to define this relation as polymorph.
   *
   * @return {Definition}
   */
  belongsTo: function(name, options){
    options = options || {}
    options.type = 'belongs_to'

    options.setter = function(record){
      var model = options.model
      var added = false

      if(Array.isArray(record)) record = record[0]

      if(options.polymorph && record){
        model = record.model
      }

      if(model && record instanceof model){
        this.relations[name] = record
        added = true
      }else{
        if(model && record && typeof record === 'object'){
          this.relations[name] = model.new(record)
          added = true
        }else{
          this.relations[name] = null
        }
      }
      if(this.relations[name] && added){
        this.model.definition.emit('relation_record_added', this, options, this.relations[name])
      }
    }

    return this.relation(name, options)
  },




  /**
  * Adds a belongs to many relation to the current Model
  *
  * @class Definition
  * @method belongsToMany
  * @param {string} name - The name of the relation
  * @param {object} options - Additional options for the relation
  *
  * @options
  * @param {string} model - The related model Name
  * @param {string} store - Optional store name for cross-store relations
  * @param {string} through - The through relation name
  * @param {string} relation - The target relation name (in conjunction with through)
  *
  * @return {Definition}
  */
  belongsToMany: function(name, options){
    options = options || {}
    options.type = 'belongs_to_many'

    options.getter = function(){
      if(!this.relations[name]){
        this[name] = null // creates a new chained model...
      }

      return this.relations[name]
    }

    options.setter = function(records){
      if(records === this.relations[name]){
        return
      }

      if(!this.relations[name]){
        if(!options.polymorph){
          this.relations[name] = options.model.chain()
        }else{
          this.relations[name] = this.model.chain({polymorph: true})
        }
        this.model.definition.emit('relation_initialized', this, options, this.relations[name])
      }

      this.relations[name].setInternal('relation_to', this)
      this.relations[name].setInternal('relation', options)

      if(!Array.isArray(records)) records = records ? [records] : []

      for(var i = 0; i < records.length; i++){
        if(records[i]){
          // add() calls emit('relation_record_added')
          this.relations[name].add(records[i])
        }
      }
    }

    return this.relation(name, options)
  },




  /**
   * Adds a has one relation to the current Model
   *
   * @class Definition
   * @method hasOne
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   *
   * @options
   * @param {string} model - The related model Name
   * @param {string} store - Optional store name for cross-store relations
   * @param {string} through - The through relation name
   * @param {string} relation - The target relation name (in conjunction with through)
   *
   * @return {Definition}
   */
  hasOne: function(name, options){
    options = options || {}
    options.type = 'has_one'

    options.setter = function(record){
      if(record instanceof options.model){
        this.relations[name] = record
      }else{
        if(Array.isArray(record)) record = record[0]

        if(record && typeof record === 'object'){
          this.relations[name] = options.model.new(record)
        }else{
          this.relations[name] = null
        }
      }
      if(this.relations[name]){
        this.model.definition.emit('relation_record_added', this, options, this.relations[name])
      }
    }

    return this.relation(name, options)
  },



  /**
   * Adds a relation which could return any data (e.g. count => integer)
   *
   * @class Definition
   * @method has
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   * @param {string} options.model - The related model Name
   * @param {string} options.store - Optional store name for cross-store relations
   * @param {string} options.through - The through relation name
   * @param {string} options.relation - The target relation name (in conjunction with through)
   *
   * @return {Definition}
   */
  has: function(name, options){
    options = options || {}
    options.type = 'has_one'

    options.setter = function(data){
      this.raw_relations[name] = data
    }
    // TODO: change back to `this.relations` - and add inspect, __exists and toJSON
    options.getter = function(){
      return this.raw_relations[name]
    }

    return this.relation(name, options)
  }
}





/*
 * RECORD
 */
exports.record = {

  set: function(field, value){
    var tmp = this.callParent(field, value)

    if(typeof field === 'object'){
      this.relations = this.relations || {}

      for(var name in this.definition.relations){
        if(this.definition.relations.hasOwnProperty(name)){
          if(field[name] !== null && field[name] !== undefined) this[name] = field[name]
        }
      }
    }

    return tmp
  }

}


/***/ }),
/* 34 */
/***/ (function(module, exports) {

exports.definition = {


  /**
   * require one or multiple files and/or node modules to extend your model definition.
   * The file needs to export either a function, which will be called with the definition scope
   * or an objects which will be mixed into the defintion object.
   *
   * @class Definition
   * @method require
   * @param {string} path - the filepath or package name
   *
   * @return {Definition}
   */
  require: function openrecordRequire(paths){
    this.include(paths)
    var result = this.store.utils.require(paths)

    for(var i = 0; i < result.length; i++){
      if(typeof result[i] === 'function'){
        result[i].call(this)
        continue
      }
    }

    return this
  },


  /**
   * mixin a module to extend your model definition.
   * The module needs to export either a function, which will be called with the definition scope
   * or an objects which will be mixed into the defintion object.
   *
   * @class Definition
   * @method mixin
   * @param {object,function} module - the module
   *
   * @return {Definition}
   */
  mixin: function(module){
    if(typeof module === 'function'){
      module.call(this)
    }else{
      this.include(module)
    }
    return this
  }

}


/***/ }),
/* 35 */
/***/ (function(module, exports) {

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.default_scopes = []
  },


  /**
   * Creates a custom chained Model method
   *
   * @class Definition
   * @method scope
   * @param {string} name - The name of the scope
   * @param {function} callback - The scope function
   *
   * @callback
   * @param {..custom..} You could define your own params.
   * @this Model
   *
   * @return {Definition}
   */
  scope: function(name, fn){
    const Utils = this.store.utils
    var tmp = function(){
      var args = Utils.args(arguments)
      var self = this.chain()

      fn.apply(self, args)

      return self
    }

    this.staticMethods[name] = tmp

    return this
  },



  /**
   * Adds a default scope
   *
   * @class Definition
   * @method defaultScope
   * @param {string} name - The name of the scope
   *
   * @return {Definition}
   */
  defaultScope: function(name){
    this.default_scopes.push(name)
    return this
  }
}


exports.model = {
  callDefaultScopes: function(){
    var calledScopes = []

    if(this.chained){
      calledScopes = this.getInternal('called_scopes') || []
    }

    for(var i = 0; i < this.definition.default_scopes.length; i++){
      var scope = this.definition.default_scopes[i]

      if(typeof this[scope] === 'function' && calledScopes.indexOf(scope) === -1){
        this[scope](this)
        calledScopes.push(scope)
      }
    }

    if(this.chained){
      this.setInternal('called_scopes', calledScopes)
    }

    return this
  }
}


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

try {
  const Fiber = __webpack_require__(37)

  exports.store = {
    sync: function(callback){
      Fiber(callback).run()
    }
  }


  exports.model = exports.record = {
    promise: function(resolver, resolve, reject){
      var store = this.definition.store
      var fiber = Fiber.current
      var promise = this.callParent(resolver, resolve, reject)

      if(fiber && !resolve && !reject){
        var gotResult = false

        promise.then(function(result){
          gotResult = true
          fiber.run(result)
        }).catch(function(err){
          if(!gotResult){
            fiber.throwInto(err)
          }else{
            store.handleException(err)
          }
        })

        return Fiber.yield()
      }else{
        return promise
      }
    }
  }
}catch(e){}


/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = require("fibers");

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

const validator = __webpack_require__(2)
const async = __webpack_require__(1)



/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.addInterceptor('beforeValidation')
  }
}



/*
 * DEFINITION
 */
exports.definition = {

  mixinCallback: function(){
    this.validations = {}
  },

  /**
   * Validate any field with a custom function.
   * Synchronous: just return `true` or `false`
   * Asynchronous: put a `done` parameter into your callback and call `done()` when finished.
   *
   * @class Definition
   * @method validates
   * @param {array} fields - The fields to validate
   * @param {function} callback - The validation callback
   *
   * @callback
   * @param {function} done - Optional: If you need a async validation, just call `done()` when finished
   * @this Record
   *
   * @return {Definition}
   */
  validates: function(fields, fn){
    if(typeof fields === 'function'){
      fn = fields
      fields = '__base'
    }
    if(!fn){ return this.definition.store.handleException(new this.definition.store.NoCallbackError()) }
    if(!Array.isArray(fields)) fields = [fields]

    for(var i in fields){
      var attr = fields[i]
      this.validations[attr] = this.validations[attr] || []

      // allow for fn to be fn() and fn(next)...
      this.validations[attr].push(function(next){
        if(fn.length === 0){
          next(null, fn.call(this))
        }else{
          fn.call(this, function(result){
            next(null, result)
          })
        }
      })
    }

    return this
  },


  /**
   * This validator checks the given field`s value is not null.
   * @class Definition
   * @method validatesPresenceOf
   * @param {array} fields - The fields to validate
   *
   * @return {Definition}
   */
  validatesPresenceOf: function(){
    var args = this.store.utils.args(arguments)
    if(args.length > 1){
      return this.validateFieldsHelper(args, this.validatesPresenceOf)
    }

    var field = args[0]

    if(Array.isArray(field)){
      return this.validateFieldsHelper(field, [], this.validatesPresenceOf)
    }

    return this.validates(field, function(){
      var valid = this[field] != null // TODO: typecast value????!
      if(!valid) this.errors.add(field, 'not valid')
      return valid
    })
  },


  /**
   * This validator checks if the given field`s value and <field_name>_confirmation are the same.
   * @class Definition
   * @method validatesConfirmationOf
   * @param {array} fields - The fields to validate
   *
   * @return {Definition}
   */
  validatesConfirmationOf: function(){
    var args = this.store.utils.args(arguments)
    if(args.length > 1){
      return this.validateFieldsHelper(args, this.validatesConfirmationOf)
    }

    var field = args[0]
    var confirmationField = field + '_confirmation'

    return this.validates(field, function(){
      var valid = (this[field] === this[confirmationField])
      if(!valid) this.errors.add(field, 'confirmation error')
      return valid
    })
  },


  /**
   * This validator checks the format of a field.
   * Valid format types are:
   * * `email`
   * * `url`
   * * `ip`
   * * `uuid`
   * * `date`
   * * null
   * * Regular expression
   *
   * @memberof Definition
   * @method validatesFormatOf
   * @param {array} fields - The fields to validate
   * @param {(string|RegExp|null)} format - The format type
   * @param {object} options - The options hash
   * @param {boolean} options.allow_null - Skip validation if value is null
   *
   * @return {Definition}
   */
  validatesFormatOf: function(field, format, options){
    options = options || {}

    if(Array.isArray(field)){
      return this.validateFieldsHelper(field, [format], this.validatesFormatOf)
    }

    return this.validates(field, function(){
      var valid = false
      var value = this[field]

      switch(format){
        case 'email':
          valid = validator.isEmail(value + '')
          break

        case 'url':
          valid = validator.isURL(value + '')
          break

        case 'ip':
          valid = validator.isIP(value + '')
          break

        case 'uuid':
          valid = validator.isUUID(value + '')
          break

        case 'date':
          valid = value instanceof Date
          break

        case null:
          valid = value === null || validator.isEmpty(value + '')
          break
        default:
          valid = validator.matches(value + '', format)
          break
      }

      if(value === null && options.allow_null) return true

      if(!valid) this.errors.add(field, 'not a valid format')
      return valid
    })
  },



  /**
   * This validator checks if the given field`s values length is lesss than or equal `length`.
   * @class Definition
   * @method validatesLengthOf
   * @param {string} field - The field to validate
   * @param {integer} length - The maximum length
   *
   * @return {Definition}
   */
  validatesLengthOf: function(field, length){
    if(Array.isArray(field)){
      return this.validateFieldsHelper(field, [length], this.validatesLengthOf)
    }

    return this.validates(field, function(){
      var valid = true
      if(this[field]) valid = (this[field].length <= length)
      if(!valid) this.errors.add(field, 'maximum length of ' + length + ' exceeded')
      return valid
    })
  },



  /**
   * This validator checks if the given field`s values is an allowed value
   * @class Definition
   * @method validatesInclusionOf
   * @param {string} field - The field to validate
   * @param {array} allowedValues - The array of allowed values
   *
   * @return {Definition}
   */
  validatesInclusionOf: function(field, allowedValues){
    if(Array.isArray(field)){
      return this.validateFieldsHelper(field, [allowedValues], this.validatesInclusionOf)
    }

    return this.validates(field, function(){
      var valid = true
      if(this[field]) valid = (allowedValues.indexOf(this[field]) !== -1)
      if(!valid) this.errors.add(field, 'only allow one of [' + allowedValues.join(', ') + ']')
      return valid
    })
  },



  /**
   * This validator checks if the given field`s values length.
   * @class Definition
   * @method validatesNumericalityOf
   * @param {string} field - The field to validate
   * @param {object} options - The options hash
   *
   * @options
   * @param {boolean} allow_null - Skip validation if value is null
   * @param {integer} eq - value need to be equal `eq`
   * @param {integer} gt - value need to be greater than `gt`
   * @param {integer} gte - value need to be greater than or equal `gte`
   * @param {integer} lt - value need to be lower than `lt`
   * @param {integer} lte - value need to be lower than or equal `lte`
   * @param {boolean} even - value need to be even
   * @param {boolean} off - value need to be odd
   *
   * @return {Definition}
   */
  validatesNumericalityOf: function(field, options){
    if(Array.isArray(field)){
      return this.validateFieldsHelper(field, [options], this.validatesNumericalityOf)
    }

    return this.validates(field, function(){
      var valid = true
      var value = this[field]

      if(options.eq !== undefined && options.eq !== value) valid = false
      if(options.gt !== undefined && options.gt >= value) valid = false
      if(options.gte !== undefined && options.gte > value) valid = false
      if(options.lt !== undefined && options.lt <= value) valid = false
      if(options.lte !== undefined && options.lte < value) valid = false
      if(options.even !== undefined && (value % 2) === 1) valid = false
      if(options.odd !== undefined && (value % 2) === 0) valid = false

      if(options.allow_null === true && value === null) valid = true

      if(!valid) this.errors.add(field, 'not a valid number')
      return valid
    })
  },


  validateFieldsHelper: function(fields, args, fn){
    if(typeof args === 'function'){
      fn = args
      args = []
    }

    for(var i in fields){
      fn.apply(this, [fields[i]].concat(args))
    }
    return this
  }
}





/*
 * RECORD
 */
exports.record = {
  /**
   * validates the record
   *
   * @class Record
   * @method validate
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {boolean} result - `true` or `false`
   * @this Promise
   */
  validate: function(resolve, reject){
    var self = this
    var validations = []

    return self.promise(function(resolve, reject){
      self.callInterceptors('beforeValidation', [self], function(okay){
        if(okay){
          for(var field in self.definition.validations){
            var fieldValidations = self.definition.validations[field]

            // set the scope of all validator function to the current record
            for(var i in fieldValidations){
              validations.push(fieldValidations[i].bind(self))
            }
          }

          async.parallel(validations, function(err, results){
            if(err) return reject(err)

            var valid = results.indexOf(false) === -1

            self.callInterceptors('afterValidation', [self, valid], function(okay){
              if(okay){
                if(valid){
                  resolve(true)
                }else{
                  resolve(false)
                }
              }else{
                resolve(false)
              }
            }, reject)
          })
        }else{
          resolve(false)
        }
      }, reject)
    }, resolve, reject)
  },


  isValid: function(callback){
    this.validate(function(valid){
      callback.call(this, valid)
    })
  }
}


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = [
  __webpack_require__(40),
  __webpack_require__(42),
  __webpack_require__(43),
  __webpack_require__(44),
  __webpack_require__(45),
  __webpack_require__(46),
  __webpack_require__(47),
  __webpack_require__(48),
  __webpack_require__(49),
  __webpack_require__(50),
  __webpack_require__(51),
  __webpack_require__(52),
  __webpack_require__(53),
  __webpack_require__(54),
  __webpack_require__(55)
]


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

const fs = __webpack_require__(41)

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.cache = this.store.getCache(this.model_name) || {}
    if(this.cacheDisabled !== true) this.store.setCache(this.model_name, this.cache)
  },

  getCache: function(key){
    return this.store.utils.clone(this.cache[key])
  },

  setCache: function(key, cache){
    this.cache[key] = this.store.utils.clone(cache)
  }
}


/*
 * STORE
 */
exports.store = {
  getCache: function(modelName){
    if(this.cache && this.cache[modelName]){
      return this.cache[modelName]
    }
  },

  setCache: function(modelName, cache){
    if(!this.cache) this.cache = {}
    this.cache[modelName] = cache
  },

  saveCache: function(filePath){
    fs.writeSync(filePath, JSON.stringify(this.cache))
  }
}


/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 42 */
/***/ (function(module, exports) {

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.afterFind(function(data){
      self.logger.trace('persistent/collection', data)
      var asJson = this.getInternal('as_json')
      var asRaw = this.getInternal('as_raw')
      var records = data.result
      var i

      if(!records) return true

      if(asJson !== true){
        // CREATE RECORDs WITH DATA
        for(i = 0; i < records.length; i++){
          records[i] = this.new(records[i], 'read')
          records[i]._exists()
        }

        data.result = this
      }else{
        // RETURN RAW JSON
        if(!asRaw){
          var allowedAttributes = this.getInternal('allowed_attributes')
          var dummyRecord = this.new() // will covert values to the right format

          for(i = 0; i < records.length; i++){
            dummyRecord.relations = {}
            dummyRecord.attributes = {}
            dummyRecord.set(records[i], 'read')
            records[i] = dummyRecord.toJson(allowedAttributes)
          }
        }
      }

      return true
    }, 55)
  }
}


/*
 * MODEL
 */
exports.model = {
  /**
   * Creates a new record and saves it
   * @class Model
   * @method create
   * @param {object} data - The data of the new record
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {boolean} result - true if the create was successful
   * @this Record
   *
   * @return {Model}
   * @see Model.save()
   */
  create: function(data, resolve, reject){
    if(Array.isArray(data)){
      return this.chain().add(data)
    }
    return this.new(data).save(resolve, reject)
  },


  /**
   * `exec()` will return raw JSON instead of records
   * @class Model
   * @method asJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   *
   * @return {Model}
   * @see Model.exec()
   */
  asJson: function(allowedAttributes){
    var self = this.chain()

    self.setInternal('as_json', true)

    if(Array.isArray(allowedAttributes)) self.setInternal('allowed_attributes', allowedAttributes)

    return self
  },


  /**
   * `exec()` will return the raw store output
   * Be aware, that no `afterFind` hook will be fired if you use `asRaw()`.
   *
   * @class Model
   * @method asRaw
   *
   * @return {Model}
   * @see Model.exec()
   */
  asRaw: function(){
    var self = this.asJson()

    self.setInternal('as_raw', true)

    return self
  }
}



/*
 * CHAIN
 */
exports.chain = {

  add: function(records){
    var self = this.callParent(records)

    var relation = self.getInternal('relation')
    var parentRecord = self.getInternal('relation_to')

    if(!Array.isArray(records)) records = [records]

    for(var i = 0; i < records.length; i++){
      var record = records[i]
      if(typeof record !== 'object'){
        if(!relation || !relation.through || !parentRecord) continue

        var throughRel = parentRecord.model.definition.relations[relation.through]
        var targetRel = throughRel.model.definition.relations[relation.relation]

        var tmp = {}
        var base

        for(base in throughRel.conditions){
          if(throughRel.conditions[base] && throughRel.conditions[base].attribute){
            tmp[base] = parentRecord[throughRel.conditions[base].attribute]
          }else{
            tmp[base] = throughRel.conditions[base]
          }
        }

        for(base in targetRel.conditions){
          if(targetRel.conditions[base] && targetRel.conditions[base].attribute){
            tmp[targetRel.conditions[base].attribute] = record
          }
        }

        if(throughRel.type === 'has_many' || throughRel.type === 'belongs_to_many'){
          parentRecord[relation.through].add(tmp)
        }else{
          parentRecord[relation.through] = tmp
        }
      }
    }

    return self
  },

  _exists: function(){
    for(var i = 0; i < this.length; i++){
      this[i]._exists()
    }
  }
}



/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var chainedModel = config ? config.__chained_model : null

    if(this.model.chained){
      chainedModel = this
    }

    Object.defineProperty(this, '__chained_model', {enumerable: false, writable: true, value: chainedModel})
    Object.defineProperty(this, '__exists', {enumerable: false, writable: true, value: false})
  },

  _exists: function(){
    this.__exists = true
    this.changes = {} // Hard-Reset all changes

    for(var name in this.definition.relations){
      if(this.definition.relations.hasOwnProperty(name)){
        if(this.relations && this.relations[name]){
          this.relations[name]._exists()
        }
      }
    }
  }
}


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)
const inflection = __webpack_require__(3)


/*
 * MODEL
 */
exports.model = {
  /**
   * Find one or multiple records by their primary key
   * @class Model
   * @method find
   * @param {integer} id - Find one record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   * @or
   * @param {array} ids - Find multiple record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   *
   * @return {Model}
   */
  find: function(){
    var self = this.chain()
    var args = this.definition.store.utils.args(arguments)
    var primaryKeys = self.definition.primary_keys

    var where = {}
    var callback
    var findOne = true

    if(typeof args[args.length - 1] === 'function'){
      callback = args.pop()
    }

    if(args.length === primaryKeys.length){
      for(var i = 0; i < primaryKeys.length; i++){
        if(args[i]){
          where[primaryKeys[i]] = args[i]

          if(Array.isArray(args[i])){
            findOne = false
          }
        }
      }
      args = [where]
    }

    if(callback){
      args.push(callback)
    }

    // if null was given to find!
    if(args.length === 1 && (args[0] === null || args[0] === undefined)){
      self.addInternal('exec_null', true)
      return self
    }

    if(findOne) self.limit(1)

    return self.where.apply(self, args)
  },


  /**
   * Similar to `find`, but it will throw an error if there are no results
   * @class Model
   * @method get
   * @param {integer} id - Find one record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   * @or
   * @param {array} ids - Find multiple record by their primary key
   * @param {function} callback - Optional: The `exec` callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   *
   * @return {Model}
   */
  get: function(){
    var self = this.chain()
    return self.expectResult().find.apply(self, arguments)
  },



  /**
   * Set some conditions
   * @class Model
   * @method where
   * @param {object} conditions - every key-value pair will be translated into a condition
   * @param {function} callback - Optional: The `exec` callback
   * @or
   * @param {array} conditions - The first element must be a condition string with optional placeholder (?), the following params will replace this placeholders
   * @param {function} callback - Optional: The `exec` callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   *
   * @return {Model}
   */
  where: function(){
    var self = this.chain()
    var args = this.definition.store.utils.args(arguments)
    var callback

    if(typeof args[args.length - 1] === 'function'){
      callback = args.pop()
    }

    var conditions = this.definition.store.utils.sanitizeConditions(this, args)

    self.addInternal('conditions', conditions)

    if(callback){
      return self.exec(callback)
    }

    return self
  },









  _applyCondtions: function(conditions, findObj, callback){
    var self = this
    var calls = []

    for(var i = 0; i < conditions.length; i++){
      if(!conditions[i]) continue;

      (function(condition){
        calls.push(function(done){
          var interceptor = 'on' + inflection.camelize(condition.type) + 'Condition'
          self.callInterceptors(interceptor, [self, condition, findObj], function(){
            done()
          })
        })
      })(conditions[i])
    }


    if(calls.length === 0){
      return callback()
    }

    async.parallel(calls, function(err){
      callback(err)
    })
  }

}


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.beforeFind(function(findObj, next){
      var conditions = this.getInternal('conditions') || []
      this._applyCondtions(conditions, findObj, next)
    }, -70)





    this.onHashCondition(function(chain, condition, findObj, next){
      var attribute = condition.model.definition.attributes[condition.attribute]
      var dataType = attribute.type
      var operator = dataType.operators[condition.operator]
      var value = condition.value
      var method = operator.method


      if(value && value.length === 0 && operator.nullify_empty_array !== false){
        value = null
      }


      var valueType = typeof value
      if(Array.isArray(value)) valueType = 'array'
      if(value instanceof Date) valueType = 'date'
      if(value instanceof Buffer) valueType = 'binary'
      if(value === null || value === undefined) valueType = 'null'
      if(valueType === 'object' && value.attribute) valueType = 'attribute'

      if(operator.on){
        if(operator.on[valueType] || (operator.on[valueType] !== false && operator.on.all !== false)){
          if(typeof operator.on[valueType] === 'function') method = operator.on[valueType]
        }else{
          if(process.env.NODE_ENV !== 'test') this.logger.warn("Operator '" + operator.name + "' of attribute '" + condition.attribute + "' can't process value of type '" + valueType + "'")
          return
        }
      }

      method.call(chain, condition.attribute, value, findObj, condition)

      next()
    })
  }

}


/***/ }),
/* 44 */
/***/ (function(module, exports) {

exports.definition = {
  /**
   * add a special convert function to manipulate the read (`exec()`) value of an attribute
   *
   * @class Definition
   * @method convertRead
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   * @param {boolean} force_type - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertRead: function(attribute, fn, forceType){
    return this.convert('read', attribute, fn, forceType)
  },

  /**
   * add a special convert function to manipulate the write (`save()`) value of an attribute
   *
   * @class Definition
   * @method convertWrite
   * @param {string} attribute - The attribute name
   * @param {function} fn - The convert function
   * @param {boolean} force_type - Default: `true`. If set to `false` it will leave your return value untouched. Otherwiese it will cast it to the original value type.
   *
   * @callback
   * @param {variable} value - the value to convert
   * @this Record
   *
   * @return {Definition}
   */
  convertWrite: function(attribute, fn, forceType){
    return this.convert('write', attribute, fn, forceType)
  }

}


/***/ }),
/* 45 */
/***/ (function(module, exports) {


var noCastFn = function(value){
  return value
}


exports.store = {
  addType: function(name, cast, options){
    if(typeof cast === 'object'){
      if(!cast.input) cast.input = noCastFn
      if(!cast.output) cast.output = noCastFn
    }

    if(typeof name === 'string') name = name.toLowerCase()
    if(typeof cast === 'function') cast = {input: cast, output: cast, read: cast, write: cast}


    if(typeof name === 'string'){
      if(!options || !options.extend){
        if(!cast.read) throw new Error('No read cast() method given for type "' + name + '"')
        if(!cast.write) throw new Error('No write cast() method given for type "' + name + '"')
      }
    }

    if(options && options.operators){
      var ops = options.operators
      var opName

      // loop over all custom operators
      for(opName in ops){
        if(ops.hasOwnProperty(opName) && opName !== 'defaults' && opName !== 'default'){
          if(typeof ops[opName] === 'function'){
            ops[opName] = {name: opName, method: ops[opName]} // this is the default operator format.
          }else{
            if(!ops[opName].name) ops[opName].name = opName
            if(!ops[opName].method) throw new Error('No method given for operator "' + opName + '"')
          }
        }
      }

      // set the default operator for that type
      ops.default = ops.default || this.operator_default

      // set default operators (defined via store.addOperator)
      if(Array.isArray(ops.defaults)){
        for(var i = 0; i < ops.defaults.length; i++){
          opName = ops.defaults[i]
          if(this.operator_types[opName] && !ops[opName]){
            ops[opName] = this.operator_types[opName]
          }
        }
        delete ops.defaults
      }
    }

    return this.callParent(name, cast, options)
  }
}


/***/ }),
/* 46 */
/***/ (function(module, exports) {


exports.model = {

  /**
   * Executes the find
   *
   * @class Model
   * @method exec
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   */
  exec: function(resolve, reject){
    var self = this.chain()

    // if .find(null) was called
    if(self.getInternal('exec_null')){
      return resolve(null)
    }

    var dataLoaded = self.getInternal('data_loaded')


    var options = self.getExecOptions()

    return self.promise(function(resolve, reject){
      self.callInterceptors('beforeFind', [options], function(okay){
        if(okay){
          var data = {}

          if(dataLoaded) data.result = dataLoaded

          self.callInterceptors('onFind', [options, data], function(){
            if(data.error){
              return reject(data.error)
            }

            var asRaw = self.getInternal('as_raw')

            if(asRaw){
              resolve(data.result)
            }else{
              self.callInterceptors('afterFind', [data], function(okay){
                if(okay){
                  resolve(data.result)
                }else{
                  resolve(null)
                }
              }, reject)
            }
          })
        }else{
          resolve(null)
        }
      }, reject)
    }, resolve, reject)
  },


  getExecOptions: function(){
    return {}
  }
}


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {


exports.store = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    Store.addExceptionType(function RecordNotFoundError(Model){
      Error.apply(this)
      this.message = "Can't find any record for " + Model.definition.model_name
    })
  }
}


/*
 * MODEL
 */
exports.model = {
  /**
   * When called, it will throw an error if the resultset is empty
   * @class Model
   * @method expectResult
   *
   * @see Model.get
   *
   * @return {Model}
   */
  expectResult: function(){
    var self = this.chain()

    self.setInternal('expectResult', true)

    return self
  }
}



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    this.afterFind(function(data){
      this.logger.trace('persistent/expect_result', data)
      var expectResult = this.getInternal('expectResult')

      if(expectResult && (!data.result || data.result.length === 0)){
        throw new Store.RecordNotFoundError(this)
      }

      return true
    }, 10)
  }
}


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)

/*
 * MODEL
 */
exports.model = {
  /**
   * Include relations into the result
   * @class Model
   * @method include
   * @param {array} includes - array of relation names to include
   * @or
   * @param {object} includes - for nested includes use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  include: function(){
    const Utils = this.definition.store.utils

    var self = this.chain()
    var relations = Utils.sanitizeRelations(self, Utils.args(arguments))


    for(var i = 0; i < relations.length; i++){
      self.addInternal('includes', {
        relation: relations[i].relation,
        parent: relations[i].parent,
        name_tree: relations[i].name_tree,
        sub_includes: relations[i].sub_relations,
        as: relations[i].as,
        scope: relations[i].scope,
        args: relations[i].args
      })
    }

    return self
  }
}



/*
 * RECORD
 */
exports.record = {
  /**
   * Include relations into the result
   * @class Record
   * @method include
   * @param {array} includes - array of relation names to include
   * @or
   * @param {object} includes - for nested includes use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  include: function(){
    var model = this.definition.model
    var collection = model.include.apply(model, this.definition.store.utils.args(arguments))

    // add the current record to the collection
    collection.addInternal('data_loaded', [this])
    collection.setInternal('limit', 1)


    return collection
  }
}



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    const Utils = this.store.utils

    this.beforeFind(function(){
      var includes = this.getInternal('includes') || []
      var conditions = this.getInternal('conditions') || []
      var processed = this.getInternal('includes_processes')

      if(processed) return true


      var processedRelations = []
      var includeTree = {}
      for(var i = 0; i < includes.length; i++){
        if(includes[i]){
          var relation = includes[i].relation
          var tmp = []

          if(relation){
            // if there are multiple includes of the same relation - only take one
            if(processedRelations.indexOf(relation.name) !== -1){
              includes.splice(i, 1)
              i--
              continue
            }

            processedRelations.push(relation.name)

            // add all conditions which relate to the included relation
            for(var c = 0; c < conditions.length; c++){
              if(conditions[c] && conditions[c].name_tree.indexOf(relation.name) !== -1){
                var cond = Utils.clone(conditions[c])
                cond.name_tree.shift()
                tmp.push(cond)
                delete conditions[c]
              }
            }

            includes[i].conditions = tmp

            // convert the flatt includes list into a tree like structure
            // TODO: we get the whole thing as a tree like structure... so why are we doing this here?
            var pos = includes[i].name_tree.length - 1
            var parentName
            var parent

            includeTree[includes[i].name_tree.join('.')] = includes[i]

            do{
              parentName = includes[i].name_tree.slice(0, pos).join('.')
              parent = includeTree[parentName]
              pos--
            }while(!parent && pos > 0)

            if(parent){
              parent.child_includes = parent.child_includes || []
              parent.child_includes.push(includes[i])

              if(includes[i].as){
                var baseParent = includeTree[includes[i].name_tree[0]]
                var as = includes[i].as[0]
                var take = includes[i].name_tree.slice(1)

                if(includes[i].as.length > 1){
                  // freaky stuff... calucalte the new "as" name (last element)...
                  as = includes[i].as[includes[i].as.length - 1]
                  // ... caluclate the path to that element...
                  take = includes[i].name_tree.slice(includes[i].as.length)
                  // ... and get that include object for it
                  baseParent = includeTree[includes[i].name_tree.slice(0, includes[i].as.length).join('.')]
                }

                if(baseParent){
                  baseParent.take = baseParent.take || {}
                  baseParent.take[as] = take
                }
              }

              includes[i].name_tree = includes[i].name_tree.slice(-1)

              includes.splice(i, 1)
              i--
            }
          }
        }else{
          // just to make sure everything will go smooth - remove empty objects
          includes.splice(i, 1)
          i--
        }
      }

      return true
    }, -10)





    this.afterFind(function(data, next){
      this.logger.trace('persistent/include', data)
      var self = this
      var records = data.result
      var includes = self.getInternal('includes') || []
      var asJson = self.getInternal('as_json')

      if(!records) return next()

      var calls = []

      for(var i = 0; i < includes.length; i++){
        // we dont need to do anything if we dont have any records - except it's a scope
        if(records.length === 0 && !includes[i].scope){ // TODO: scopes on the base should be done in parallel to the initial find ... this is a little bit tricky, because is currently no way to call a function after everything (base query + scope) is ready...
          continue
        }

        (function(include){
          calls.push(function(relationDone){
            var cache = {}
            var Chains = []

            self.callInterceptors('beforeInclude', [Chains, records, include, cache, data], function(okay){
              if(okay){
                var chainCalls = []

                for(var c = 0; c < Chains.length; c++){
                  (function(Chain){
                    chainCalls.push(function(includeDone){
                      // add child includes
                      if(include.child_includes){
                        Chain.addInternal('includes', include.child_includes)
                      }

                      // add polymorph/through includes
                      if(include.sub_includes){
                        Chain.include(include.sub_includes)
                      }

                      if(asJson){
                        Chain.asJson()
                      }

                      self.callInterceptors('onInclude', [Chain, records, include, cache, data], function(okay){
                        if(okay){
                          Chain.exec(function(result){
                            self.callInterceptors('afterInclude', [Chain.definition.model, result, records, include, cache, data, Chain], function(){
                              includeDone()
                            })
                          }).catch(function(err){
                            includeDone(err)
                          })
                        }else{
                          includeDone()
                        }
                      })
                    })
                  })(Chains[c])
                }


                if(chainCalls.length === 0){
                  return next()
                }

                async.parallel(chainCalls, function(err){
                  return relationDone(err)
                })
              }else{
                relationDone()
              }
            })
          })
        })(includes[i])
      }


      if(calls.length === 0){
        return next()
      }

      async.parallel(calls, function(err){
        next(err)
      })
    }, 80)








    this.beforeInclude(function(Chains, records, include, cache){
      if(Chains.length > 0) return // another interceptor has already done something
      if(!include.relation || include.scope) return // scopes do not have any relations - filter them out.


      var relation = include.relation
      var chain

      if(relation.polymorph && relation.type_key){
        var models = []

        for(var r = 0; r < records.length; r++){
          var modelName = records[r][relation.type_key]

          if(typeof relation.type_key === 'function'){
            modelName = relation.type_key(records[r])
          }

          if(modelName && models.indexOf(modelName) === -1){
            models.push(modelName)

            var Model = this.definition.store.Model(modelName)
            if(Model){
              chain = Model.chain()
              if(relation.scope && chain[relation.scope]) chain[relation.scope].apply(chain, include.args || [])
              Chains.push(chain)
            }
          }
        }
      }else{
        chain = relation.model.chain()

        if(relation.scope && chain[relation.scope]){
          chain[relation.scope].apply(chain, include.args || [])
        }
      }

      if(chain){
        if(relation.scope_per_record){
          // expensive!!
          for(var i = 0; i < records.length; i++){
            var clone = chain.clone()
            clone.setInternal('recordIndex', i)
            Chains.push(clone)
          }
        }else{
          Chains.push(chain)
        }
      }
    }, 100)




    this.onInclude(function(Chain, records, include, cache){
      if(!include.relation || include.scope) return // scopes do not have any relations - filter them out.

      var relation = include.relation
      var conditions = relation.conditions
      var condition = {}


      // add include conditions
      if(include.conditions){
        Chain.addInternal('conditions', include.conditions)
      }

      // loop over base conditions and replace attribute=attribute conditions with attribute = [ids,...]
      for(var base in conditions){
        if(conditions.hasOwnProperty(base) && conditions[base] && conditions[base].attribute){
          condition[base] = []

          var i = 0
          var length = records.length

          if(relation.scope_per_record){
            i = Chain.getInternal('recordIndex')
            length = i + 1
          }

          for(i; i < length; i++){
            if(relation.polymorph){
              var modelName = records[i][relation.type_key]

              if(typeof relation.type_key === 'function'){
                modelName = relation.type_key(records[i])
              }
              if(modelName !== Chain.definition.model_name) continue
            }

            var id = records[i][conditions[base].attribute]
            if(!Array.isArray(id)) id = [id]

            for(var x = 0; x < id.length; x++){
              if(id[x] && condition[base].indexOf(id[x]) === -1){
                condition[base].push(id[x])
              }
            }
          }
        }else{
          condition[base] = conditions[base]
        }
      }

      Chain.where(condition)
    })






    this.afterInclude(function(Model, result, records, include, cache, data, Chain){
      if(!include.relation) return // scopes do not have any relations - filter them out.

      if(result === null || result === undefined || result.length === 0) return 'STOP'
      if(!Array.isArray(result)) result = [result]

      var relation = include.relation
      var conditions = relation.conditions


      if(relation.scope_per_record){
        var index = Chain.getInternal('recordIndex')

        if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
          records[index][relation.name] = result
        }else{
          records[index][relation.name] = result[0]
        }

        return
      }

      if(Object.keys(conditions).length === 0) return

      // add result into records - based in the conditions - a kind of offline join
      for(var i = 0; i < result.length; i++){
        for(var r = 0; r < records.length; r++){
          var matches = 0
          var rules = 0

          // check all conditions for a match!
          for(var base in conditions){
            if(conditions.hasOwnProperty(base) && conditions[base] && conditions[base].attribute){
              var key1 = records[r][conditions[base].attribute]
              var key2 = result[i][base]

              if(Array.isArray(key1) && Array.isArray(key2)){
                if(relation.contains === true){ // relation option: contains: true => check if there is at least on matching value, default => check strict equality
                  if(key1.filter(function(k){ return key2.indexOf(k) !== -1 }).length > 0){ // intersect
                    matches++
                  }
                }else{
                  if(key1.sort().toString() === key2.sort().toString()){ // strict equal
                    matches++
                  }
                }
              }else{
                if(Array.isArray(key1)){
                  if(key1.indexOf(key2) !== -1){ // key1 contains key2
                    matches++
                  }
                }else{
                  if(Array.isArray(key2)){
                    if(key2.indexOf(key1) !== -1){ // key2 contains key1
                      matches++
                    }
                  }else{
                    if(key1 === key2){ // key1 equal key2
                      matches++
                    }
                  }
                }
              }

              rules++
            }
          }

          if(relation.polymorph){
            var modelName = records[r][relation.type_key]

            if(typeof relation.type_key === 'function'){
              modelName = relation.type_key(records[r])
            }

            if(modelName === Model.definition.model_name) matches++
            rules++
          }


          if(matches === rules){
            if(relation.polymorph){
              // create a model, but only for polymoph relations.
              if(typeof result[i].set !== 'function'){
                result[i] = Model.new(result[i], 'read')
              }
            }

            if(include.take){
              for(var as in include.take){
                // TODO: check relation type as well (see below..)
                records[r][as] = records[r][as] || []
                var sr = result[i][include.take[as][0]]

                for(var t = 1; t < include.take[as].length; t++){
                  if(!sr) break
                  if(Array.isArray(sr)) sr = sr[0]
                  sr = sr[include.take[as][t]]
                }

                if(sr){
                  records[r][as].push(sr)
                }
              }
            }

            if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
              records[r][relation.name] = records[r][relation.name] || []
              records[r][relation.name].push(result[i])
            }else{
              records[r][relation.name] = records[r][relation.name] || result[i]
            }
          }
        }
      }
    }, 100)
  }
}


/***/ }),
/* 49 */
/***/ (function(module, exports) {

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    /**
     * Will be called before every SQL find. This hook will be called by `Model.exec()`
     * @class Definition
     * @method beforeFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {object} query - The internal knex instance
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Model
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeFind')

    this.addInterceptor('onFind')

    /**
     * Will be called after every SQL find. This hook will be called by `Model.exec()`
     * @class Definition
     * @method afterFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} query - The raw result object
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Model
     *
     * @return {Definition}
     */
    this.addInterceptor('afterFind')

    this.addInterceptor('beforeInclude')
    this.addInterceptor('onInclude')
    this.addInterceptor('afterInclude')

    this.addInterceptor('onHashCondition')
    this.addInterceptor('onRawCondition')
  }
}


/***/ }),
/* 50 */
/***/ (function(module, exports) {

exports.model = {
  /**
   * Limit the resultset to `n` records
   * @class Model
   * @method limit
   * @param {integer} limit - The limit as a number.
   * @param {integer} offset - Optional offset.
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  limit: function(limit, offset){
    var self = this.chain()
    offset = offset || self.getInternal('offset') || 0

    self.setInternal('limit', limit)
    self.setInternal('offset', offset)

    return self
  },


  /**
   * Sets only the offset
   * @class Model
   * @method offset
   * @param {integer} offset - The offset.
   *
   * @see Model.limit
   *
   * @return {Model}
   */
  offset: function(offset){
    var self = this.chain()

    self.setInternal('offset', offset)

    return self
  }
}

exports.definition = {
  mixinCallback: function(){
    var self = this

    this.afterFind(function(data){
      self.logger.trace('persistent/limit', data)
      var limit = this.getInternal('limit')

      if(limit === 1 && Array.isArray(data.result)){
        data.result = data.result[0]
      }

      return true
    }, 40)
  }
}


/***/ }),
/* 51 */
/***/ (function(module, exports) {

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.operator_types = {}
    this.operator_default = null
  },



  // register global operators - could be overwritten per data type
  addOperator: function(name, fn, options){
    options = options || {}

    if(!name) throw new Error('No name given')
    if(!fn) throw new Error('No valid method given')

    if(typeof name === 'string') name = name.toLowerCase()

    options.name = name
    options.method = fn

    this.operator_types[name] = options
    if(options.default) this.operator_default = name
  },


  getOperator: function(name){
    if(typeof name === 'string') name = name.toLowerCase()
    return this.operator_types[name] || this.operator_types[this.operator_default]
  }
}


/***/ }),
/* 52 */
/***/ (function(module, exports) {

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.primary_keys = []

    this.use(function(){
      for(var name in self.attributes){
        if(self.attributes[name].primary){
          self.primary_keys.push(name)
        }
      }
    }, 0)
  }
}


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

const inflection = __webpack_require__(3)

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    /**
     * Adds a has many relation to the current Model
     *
     * @class Definition
     * @method hasMany
     *
     * @options
     * @param {string} primary_key - SQL only
     * @param {string} foreign_key - SQL only
     * @param {string} as - the name of a polymophic relation - SQL only
     * @param {object} conditions - Extra conditions for the relation - SQL only
     * @param {string} dependent - `destroy`, `delete`, `nullify` or null. Default to null - SQL only
     *
     */


    /**
     * Adds a belongs to relation to the current Model
     *
     * @class Definition
     * @method belongsTo
     *
     * @options
     * @param {string} primary_key - SQL only
     * @param {string} foreign_key - SQL only
     * @param {string} type_key - the name of the polymorphic relation. You need to have a <name>_type and <name>_<primary_key> attribute on your model. Default is the relation name - SQL only
     * @param {object} conditions - Extra conditions for the relation - SQL only
     * @param {string} dependent - `destroy`, `delete` or null. Default to null - SQL only
     *
     */


    /**
     * Adds a has one relation to the current Model
     *
     * @class Definition
     * @method hasOne
     *
     * @options
     * @param {string} primary_key - SQL only
     * @param {string} foreign_key - SQL only
     * @param {object} conditions - Extra conditions for the relation
     * @param {string} dependent - `destroy`, `delete` or null. Default to null - SQL only
     *
     */

    this.on('relation_added', function(options){
      var primaryKey = this.primary_keys[0] || 'id' // TODO: support multiple primary keys...
      options.conditions = options.conditions || {}

      if(options.scope){
        if(options.scope.match(/^!/)){
          // scope_per_record is expensive! It will run a query for every base record to receive relational data
          options.scope = options.scope.replace(/^!/, '')
          options.scope_per_record = false
        }
        options.scope_per_record = true
      }

      if(options.as){
        options.foreign_key = options.foreign_key || options.as + '_' + primaryKey
        options.conditions[options.polymorphic_type || options.as + '_type'] = self.model_name
      }

      if(options.polymorph){
        options.type_key = options.type_key || options.name + '_type'

        if(!options.primary_key && primaryKey){
          options.primary_key = options.name + '_' + primaryKey
        }

        options.foreign_key = options.foreign_key || primaryKey
      }

      if(options.type === 'has_many' || options.type === 'has_one'){
        options.primary_key = options.primary_key || primaryKey

        if(!options.foreign_key && primaryKey){
          options.foreign_key = options.foreign_key || inflection.singularize(self.getName()) + '_' + primaryKey
        }
      }

      if(options.type === 'belongs_to'){
        if(!options.primary_key && primaryKey){
          options.primary_key = inflection.singularize(options.model.definition.getName()) + '_' + primaryKey
        }

        options.foreign_key = options.foreign_key || primaryKey

        if(!self.attributes[options.primary_key]){ // if there is no primary_key field available, try relation_name + _id
          options.primary_key = inflection.singularize(options.name) + '_' + primaryKey
        }
      }

      if(options.type === 'belongs_to_many'){
        if(!options.primary_key && primaryKey){
          options.primary_key = inflection.singularize(options.model.definition.getName()) + '_' + primaryKey + 's'
        }

        options.foreign_key = options.foreign_key || primaryKey

        if(!self.attributes[options.primary_key]){ // if there is no primary_key field available, try relation_name + _ids
          options.primary_key = inflection.singularize(options.name) + '_' + primaryKey + 's'
        }
      }


      // check if the primary_key field exists - delete if not!
      if(!self.attributes[options.primary_key]){
        options.primary_key = undefined
      }

      if(options.primary_key && !options.through){
        options.conditions = options.conditions || {}
        options.conditions[options.foreign_key] = {attribute: options.primary_key, model: self.model}
      }

      // TODO: primary_key and foreign_key are here for backwards compatibility... remove them with version 2.0!


      // create magic attribute <relation_name>_ids = [1, 2, 3]
      if(options.type === 'has_many' && options.primary_key){
        var attrName = inflection.singularize(options.name) + '_' + inflection.pluralize(options.primary_key)

        self.attribute(attrName, Array, {
          hidden: true,
          setter: function(value){
            this[options.name].add(value)
            this.set(attrName, value)
          }
        })
      }
    })



    this.on('relation_record_added', function(parent, options, record){
      // if records with an id/primary key are added, mark the record as existing => a save will trigger an update!
      var primaryKeys = self.primary_keys
      var existingKeys = 0

      for(var i = 0; i < primaryKeys.length; i++){
        if(record[primaryKeys[i]]){
          existingKeys++
        }
      }

      if(existingKeys === primaryKeys.length && existingKeys > 0){
        record.__exists = true
      }


      if(options.through){
        var throughRel = parent.model.definition.relations[options.through]
        var targetRel = throughRel.model.definition.relations[options.relation]

        var tmp = {}
        tmp[throughRel.foreign_key] = parent[throughRel.primary_key]
        tmp[targetRel.primary_key] = record[targetRel.foreign_key]
        tmp[options.relation] = record

        if(throughRel.type === 'has_many' || throughRel.type === 'belongs_to_many'){
          parent[options.through].add(tmp)
        }else{
          parent[options.through] = tmp
        }
      }else{
        var attrs = self.store.utils.clone(options.conditions)

        for(var base in attrs){
          if(attrs[base] && attrs[base].attribute){
            if(options.type === 'has_many' || options.type === 'has_one'){
              if(parent[attrs[base].attribute]){
                attrs[base] = parent[attrs[base].attribute]
              }else{
                delete attrs[base]
              }
            }else{
              if(options.type === 'belongs_to_many'){
                if(record[base]){
                  attrs[attrs[base].attribute] = attrs[attrs[base].attribute] || []
                  attrs[attrs[base].attribute].push(record[base])
                }
              }else{
                if(record[base]){
                  attrs[attrs[base].attribute] = record[base]
                }
              }

              delete attrs[base]
            }
          }
        }

        if(options.type === 'has_many' || options.type === 'has_one'){
          record.set(attrs)
        }else{
          parent.set(attrs)
        }
      }
    })



    this.on('relation_initialized', function(record, options, collection){
      if(options.type === 'has_many' && !options.polymorph){
        var attrs = self.store.utils.clone(options.conditions) || {}

        for(var base in attrs){
          if(attrs[base] && attrs[base].attribute){
            if(record[attrs[base].attribute]){
              attrs[base] = record[attrs[base].attribute]
            }else{
              delete attrs[base]
            }
          }
        }

        collection.where(attrs)
      }
    })
  }
}


/*
 * RECORD
 */
exports.record = {


  // check if the given record have the primary key set => update instead of create!
  set: function(field, value){
    if(typeof field === 'object'){
      var castType = value

      this.relations = this.relations || {}

      for(var name in this.definition.relations){
        if(this.definition.relations.hasOwnProperty(name)){
          var data = field[name]
          if(data){
            var relation = this.definition.relations[name]
            if(!relation.model) continue
            var primaryKeys = relation.model.definition.primary_keys

            if(!Array.isArray(data)) data = [data]

            for(var o = 0; o < data.length; o++){
              if(typeof data[o] !== 'object') continue

              var records = this.relations[name] || [] // search the record with the primary key - if available
              for(var i = 0; i < primaryKeys.length; i++){
                var key = primaryKeys[i]
                var tmp = []
                if(data[o][key]){
                  for(var x = 0; x < records.length; x++){
                    if(records[x][key] === data[o][key]){
                      tmp.push(records[x])
                    }
                  }
                  records = tmp
                }
              }

              if(records.length > 0){
                records[0].set(data[o], castType)
                delete field[name]
              }
            }
          }
        }
      }
    }

    return this.callParent(field, value)
  }

}


/***/ }),
/* 54 */
/***/ (function(module, exports) {

exports.definition = {
  mixinCallback: function(){
    this.beforeInclude(function(Chains, records, include, cache){
      if(include.scope){
        if(include.relation){
          Chains.push(include.relation.model.chain())
        }else{
          Chains.push(this.model.chain())
        }
      };
    })

    this.onInclude(function(Chain, records, include){
      if(include.scope && typeof Chain[include.scope] === 'function'){
        if(this.getInternal('conditions')) Chain.addInternal('conditions', this.getInternal('conditions'))
        if(this.getInternal('joins')) Chain.addInternal('joins', this.getInternal('joins'))

        Chain[include.scope](include.scope_attributes)// TODO: where do they come from?
      }
    })



    this.afterInclude(function(Model, result, records, include, cache){
      if(include.scope){
        var varName = '$' + include.scope

        if(include.relation){
          varName = include.relation.name + '$' + include.scope
        }

        this[varName] = result
      }
    })
  }
}


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

exports.utils = {

  sanitizeRelations: function(parent, relations, nameTree, through){
    const Store = __webpack_require__(0)
    var tmp = []

    if(!nameTree) nameTree = []
    if(!through) through = {}
    if(!Array.isArray(relations)) relations = [relations]

    for(var i = 0; i < relations.length; i++){
      if(typeof relations[i] === 'string'){
        var tmpSplit = relations[i].split(':')
        var relName = tmpSplit[0]
        var scope = tmpSplit[1]

        var relation = parent.definition.relations[relName]
        if(relation){
          if(relation.through){
            var throughRel = {}
            throughRel[relation.through] = relation.relation

            through.name = through.name || relation.relation
            through.name_tree = through.name_tree || nameTree.concat(relation.name)

            tmp = tmp.concat(exports.utils.sanitizeRelations(parent, throughRel, nameTree, through))
          }else{
            tmp.push({
              relation: relation,
              parent: parent,
              name_tree: nameTree.concat(relation.name),
              scope: scope
            })

            if(through){
              if(through.name === relation.name){
                tmp[tmp.length - 1].as = through.name_tree
                through.name_tree = null
                through.name = null
              }
            }
          }
        }else{
          if(scope){
            tmp.push({
              name_tree: nameTree.concat(parent.definition.getName()),
              scope: scope
            })
          }else{
            throw new Store.RelationNotFoundError(parent, relations[i])
          }
        }
      }else{
        if(Array.isArray(relations[i])){
          tmp = tmp.concat(exports.utils.sanitizeRelations(parent, relations[i], nameTree, through))
        }else{
          for(var name in relations[i]){
            tmpSplit = name.split(':')
            relName = tmpSplit[0]
            scope = tmpSplit[1]

            var args = []

            relation = parent.definition.relations[relName]
            if(relation){
              if(relations[i][name].$args){
                args = relations[i][name].$args
                delete relations[i][name].$args

                if(!Array.isArray(args) && typeof args === 'object'){
                  if(relation.scope && relation.model[relation.scope] && relation.model[relation.scope].options){
                    var argsMapping = relation.model[relation.scope].options.args_mapping

                    if(argsMapping){
                      args = argsMapping.map(function(name){
                        return args[name]
                      })
                    }
                  }
                }
              }


              if(relation.through){
                throughRel = {}
                throughRel[relation.through] = {}
                throughRel[relation.through][relation.relation] = [relations[i][name]]

                through.name = through.name || relation.relation
                through.name_tree = through.name_tree || nameTree.concat(relation.name)

                tmp = tmp.concat(exports.utils.sanitizeRelations(parent, throughRel, nameTree, through))
              }else{
                var subRelations = null

                if(relation.polymorph){
                  subRelations = relations[i][name]
                  if(Array.isArray(subRelations) && subRelations.length === 1) subRelations = subRelations[0]
                }

                tmp.push({
                  relation: relation,
                  parent: parent,
                  name_tree: nameTree.concat(relation.name),
                  sub: relations[i][name],
                  sub_relations: subRelations,
                  scope: scope,
                  args: args
                })

                if(through){
                  if(through.name === relation.name){
                    tmp[tmp.length - 1].as = through.name_tree
                    through.name_tree = null
                    through.name = null
                  }
                }

                if(!relation.polymorph){
                  tmp = tmp.concat(exports.utils.sanitizeRelations(relation.model, [relations[i][name]], nameTree.concat(relation.name), through))
                }
              }
            }else{
              if(scope){
                tmp.push({
                  name_tree: nameTree.concat(parent.definition.getName()),
                  scope: scope
                })
              }else{
                throw new Store.RelationNotFoundError(parent, name)
              }
            }
          }
        }
      }
    }

    return tmp
  },


  sanitizeConditions: function(parent, conditions, nameTree, relation){
    var result = []

    if(!nameTree) nameTree = []
    if(!Array.isArray(conditions)) conditions = [conditions]

    for(var i = 0; i < conditions.length; i++){
      // raw conditions via string... ['string with conditions and placeholers', param1, param2, param3,...]
      if(typeof conditions[i] === 'string' && i === 0){
        // if we use something like ["login = ?", "phil"]
        var args = conditions.slice(1)
        var query = conditions[0]

        if(typeof args[0] === 'object' && !Array.isArray(args[0])){
          // if we use ["login = :login", {login:"phil"}]
          var values = args[0]
          var tmp = []
          args = []
          query = query.replace(/:(\w+)/g, function(res, field){
            args.push(values[field])
            return '?' // use a questionmark a placeholder...
          })
        }

        return [{
          type: 'raw',
          query: query,
          args: args,
          name_tree: nameTree
        }]
      }



      // hash conditions
      if(Array.isArray(conditions[i])){
        // call sanitizeConditions recursive
        result = result.concat(exports.utils.sanitizeConditions(parent, conditions[i], nameTree))
      }else{
        // if we use {login:'phil'} or {login_like:'phil'}
        for(var name in conditions[i]){
          if(conditions[i].hasOwnProperty(name)){
            var currentRelation = parent.definition.relations[name]

            // if it's a relations e.g.: {posts:{title:'First post'}}
            if(currentRelation){
              // sanitize the relation and call sanitizeConditions recursiv
              var rel = exports.utils.sanitizeRelations(parent, name, nameTree)
              rel = rel[rel.length - 1]
              result = result.concat(exports.utils.sanitizeConditions(rel.relation.model, [conditions[i][name]], rel.name_tree, currentRelation))
            }else{
              var operator = null
              var value = conditions[i][name]
              var attrs = parent.definition.attributes

              // if it's a reference to another attribute - enhance it with additional information
              if(value && typeof value === 'object' && value.attribute){
                if(value.model){
                  value.name_tree = value.name_tree || nameTree.slice(0, -1)
                }else{
                  value.name_tree = value.name_tree || nameTree.slice()

                  if(value.relation){
                    var pos = value.name_tree.lastIndexOf(value.relation)
                    if(pos !== -1){
                      value.name_tree = value.name_tree.slice(0, pos + 1)
                    }else{
                      value.name_tree = value.name_tree.concat(value.relation)
                    }
                  }
                }
                value.model = value.model || parent
              }

              // first check if there is an operator applied
              if(parent.definition.attributes[name]){
                // ignore the condition if the attribute's type does not have any operators
                if(!attrs[name].type.operators){
                  parent.definition.store.logger.warn("Can't find a default operator for attribute '" + name + "'")
                  continue
                }

                // just the attribute name
                operator = attrs[name].type.operators.default // use the default operator of that type
              }else{
                // it could be an unknown attribute or a known one with an operator applied
                tmp = name.split('_')
                var op = []
                var tmpName

                while(tmp.length > 1 && !operator){
                  op.unshift(tmp.splice(-1))
                  tmpName = tmp.join('_')
                  if(attrs[tmpName]){
                    operator = op.join('_')
                  }
                }

                // ignore the condition if we could not find any defined attribute
                if(!operator){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find attribute '" + name + "' on model '" + parent.definition.model_name + "'")
                  continue
                }

                // ignore the condition if the attribute's type does not have any operators
                if(!attrs[tmpName]){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find any operator for attribute '" + tmpName + "'")
                  continue
                }

                // ignore the condition if the attribute's type does not have any operators
                if(!attrs[tmpName].type.operators){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find any operator for attribute '" + tmpName + "'")
                  continue
                }

                // ignore the condition if the operator does not exist for the attribute type
                if(!attrs[tmpName].type.operators[operator]){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find operator '" + operator + "' for attribute '" + tmpName + "' (" + attrs[tmpName].type.name + ')')
                  continue
                }

                name = tmpName
              }

              result.push({
                type: 'hash',
                model: parent,
                name_tree: nameTree,
                attribute: name,
                operator: operator,
                value: value
              })
            }
          }
        }
      }
    }

    return result
  },


  reverseConditions: function(conditions){
    for(var i = 0; i < conditions.length; i++){
      if(conditions[i].value && conditions[i].value.attribute){
        // swap only attribute comparisons
        var tmpNameTree = conditions[i].name_tree
        var tmpAttribute = conditions[i].attribute
        var tmpModel = conditions[i].model

        conditions[i].name_tree = conditions[i].value.name_tree
        conditions[i].attribute = conditions[i].value.attribute
        conditions[i].model = conditions[i].value.model

        conditions[i].value.name_tree = tmpNameTree
        conditions[i].value.attribute = tmpAttribute
        conditions[i].value.model = tmpModel

        var attrs = conditions[i].model.definition.attributes

        if(!attrs[conditions[i].attribute].type.operators[conditions[i].operator]){
          conditions[i].operator = attrs[conditions[i].attribute].type.operators.default
        }
      }
    }

    return conditions
  },


  nameTreeToRelation: function(nameTree){
    if(nameTree.length === 1){
      return nameTree[0]
    }
    var tmp = {}
    tmp[nameTree[0]] = exports.utils.nameTreeToRelation(nameTree.slice(1))
    return tmp
  },

  nameTreeToCondition: function(nameTree, conditions){
    var tmp = {}
    if(nameTree.length === 1){
      tmp[nameTree[0]] = conditions
      return tmp
    }
    tmp[nameTree[0]] = exports.utils.nameTreeToCondition(nameTree.slice(1), conditions)
    return tmp
  },


  nameTreeToNames: function(name, nameTree){
    if(nameTree.length === 1){
      name = nameTree[0]
    }

    if(nameTree.length === 2){
      name = nameTree[0] + '_' + nameTree[1]
    }

    if(nameTree.length > 2){
      var l = nameTree.length
      name = nameTree[l - 2] + '_' + nameTree[l - 1]
    }

    return name
  }

}


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = [
  __webpack_require__(57),
  __webpack_require__(58),
  __webpack_require__(59),
  __webpack_require__(60),
  __webpack_require__(61),
  __webpack_require__(62),
  __webpack_require__(63),
  __webpack_require__(64),
  __webpack_require__(65),
  __webpack_require__(66),
  __webpack_require__(67),
  __webpack_require__(68),
  __webpack_require__(69),
  __webpack_require__(70),
  __webpack_require__(71),
  __webpack_require__(72),
  __webpack_require__(73),
  __webpack_require__(74),
  __webpack_require__(75),
  __webpack_require__(76),
  __webpack_require__(77),
  __webpack_require__(78),
  __webpack_require__(79),
  __webpack_require__(80),
  __webpack_require__(81),
  __webpack_require__(82),
  __webpack_require__(83),
  __webpack_require__(84),
  __webpack_require__(85),
  __webpack_require__(86),
  __webpack_require__(87),
  __webpack_require__(88),
  __webpack_require__(89),
  __webpack_require__(90),
  __webpack_require__(91)
].concat(
  __webpack_require__(92)
)


/***/ }),
/* 57 */
/***/ (function(module, exports) {

exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var attributes = this.getCache('attributes')
      if(attributes){
        this.setTableAttributes(attributes)
        return next()
      }

      if(!this.table_name) return next()
      if(!this.store.loadTableAttributes) return next()
      if(this.store.config.diableAutoload) return next()

      var self = this

      this.store.loadTableAttributes(this.table_name)
      .then(function(attributes){
        self.setCache('attributes', attributes)
        self.setTableAttributes(attributes)
        next()
      }).catch(function(error){
        next()
        return self.store.handleException(error)
      })
    }, 80)
  },

  setTableAttributes: function(attributes){
    var self = this

    attributes.forEach(function(attr){
      self.attribute(attr.name, attr.type, attr.options)
      attr.validations.forEach(function(validation){
        self[validation.name].apply(self, [attr.name].concat(validation.args))
      })
    })
  }
}


/***/ }),
/* 58 */
/***/ (function(module, exports) {

/*
 * MODEL
 */
exports.model = {
  /**
   * Count the number of records in the database (SQL: `COUNT()`)
   *
   * @class Model
   * @method count
   * @param {string} field - Optional field name. (Default: `*`)
   * @param {boolean} distinct - Optional: DISTINCT(field). (Default: false)
   * @return {Model}
   * @see Model.exec()
   */
  count: function(field, distinct){
    var self = this.chain()
    self.setInternal('count', field || '*')
    self.setInternal('count_distinct', distinct || false)
    return self
  },

  /**
   * Calculates the sum of a certain field (SQL: `SUM()`)
   *
   * @class Model
   * @method sum
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  sum: function(field){
    var self = this.chain()
    self.setInternal('sum', field)
    return self
  },

  /**
   * Calculates the maximum value of a certain field (SQL: `MAX()`)
   *
   * @class Model
   * @method max
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  max: function(field){
    var self = this.chain()
    self.setInternal('max', field)
    return self
  },

  /**
   * Calculates the minimum value of a certain field (SQL: `MIN()`)
   *
   * @class Model
   * @method min
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  min: function(field){
    var self = this.chain()
    self.setInternal('min', field)
    return self
  }

  /* //Not yet supported by knex (?)
  avg: function(field){
    var self = this.chain();
    self.setInternal('avg', field);
    return self;
  }
  */
}



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.beforeFind(function(query){
      var aggFns = ['count', 'sum', 'min', 'max'] //, 'avg'];
      var countDistinct = this.getInternal('count_distinct')


      for(var i in aggFns){
        var tmp = this.getInternal(aggFns[i])

        if(tmp){
          if(aggFns[i] === 'count' && countDistinct){
            query.select(self.store.connection.raw('count(distinct(' + tmp + ')) as count'))
          }else{
            query[aggFns[i]](tmp + ' as ' + aggFns[i])
          }
        }
      }

      return true
    }, -30)



    this.afterFind(function(data){
      self.logger.trace('sql/aggregate_functions', data)
      var count = this.getInternal('count')
      var sum = this.getInternal('sum')
      var min = this.getInternal('min')
      var max = this.getInternal('max')
      var avg = this.getInternal('avg')

      if((count || sum || min || max || avg) && data.result.length <= 1){
        this.asJson()

        if(data.result.length === 0){
          data.result = 0
          return true
        }


        data.result = data.result[0]

        var aggFns = ['count', 'sum', 'min', 'max'] //, 'avg'];
        var fns = 0
        var lastFn

        for(var i in aggFns){
          if(data.result[aggFns[i]] !== undefined){
            data.result[aggFns[i]] = parseFloat(data.result[aggFns[i]])
            fns++
            lastFn = aggFns[i]
          }
        }

        if(fns === 1){
          data.result = data.result[lastFn]
        }
      }

      return true
    }, 70)
  }
}


/***/ }),
/* 59 */
/***/ (function(module, exports) {


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.onRawCondition(function(chain, condition, query){
      for(var i = 0; i < condition.args.length; i++){
        // Hacky fix for a knex problem!
        if(Array.isArray(condition.args[i])){
          var len = condition.args[i].length
          condition.args.splice.apply(condition.args, [i, 1].concat(condition.args[i]))

          var index = 0
          condition.query = condition.query.replace(/\?/g, function(){
            if(index === i){
              var tmp = []
              for(var k = 0; k < len; k++){
                tmp.push('?')
              }

              return tmp.join(',')
            }
            index++
            return '?'
          })

          i += len
        }
      }

      query.whereRaw(condition.query, condition.args)
    })
  }

}


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)

/*
 * RECORD
 */
exports.record = {


  /**
   * Destroy a record
   *
   * @class Record
   * @method destroy
   * @param {function} callback - The destroy callback
   *
   * @callback
   * @param {boolean} result - will be true if the destroy was successful
   * @this Record
   *
   * @return {Record}
   */
  destroy: function(options, resolve, reject){
    const Store = __webpack_require__(0)

    var self = this
    var query = this.definition.query()
    var primaryKeys = this.definition.primary_keys
    var condition = {}

    if(typeof options === 'function'){
      reject = resolve
      resolve = options
      options = null
    }


    options = options || {}
    // callback = callback.bind(this);

    for(var i = 0; i < primaryKeys.length; i++){
      condition[primaryKeys[i]] = this[primaryKeys[i]]
    }

    return self.promise(function(resolve, reject){
      self.transaction(options, function(){
        self.callInterceptors('beforeDestroy', [self, options.transaction], function(okay){
          if(okay){
            query.transacting(options.transaction).where(condition).delete().asCallback(function(err){
              self.logger.info(query.toString())

              if(err){
                options.transaction.rollback('exception')
                return reject(new Store.SQLError(err))
              }

              self.callInterceptors('afterDestroy', [self, options.transaction], function(okay){
                if(okay){
                  if(options.commit !== false){
                    options.transaction.commit()
                    options.transaction_promise.then(function(){
                      resolve(true)
                    })
                  }else{
                    resolve(true)
                  }
                }else{
                  if(options.rollback !== false){
                    options.transaction.rollback('afterDestroy')
                  }
                  resolve(false)
                }
              }, reject)
            })
          }else{
            if(options.rollback !== false){
              options.transaction.rollback('beforeDestroy')
            }
            resolve(false)
          }
        }, reject)
      })
    }, resolve, reject)
  },










  /**
   * Deletes the record. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   *
   * @class Record
   * @method delete
   * @param {function} callback - The delete callback
   *
   * @callback
   * @param {boolean} result - will be true if the delete was successful
   * @this Record
   *
   * @return {Record}
   */
  'delete': function(options, resolve, reject){
    const Store = __webpack_require__(0)

    var self = this
    var query = this.definition.query()
    var primaryKeys = this.definition.primary_keys
    var condition = {}

    if(typeof options === 'function'){
      reject = resolve
      resolve = options
      options = null
    }



    options = options || {}
    // callback = callback.bind(this);

    return self.promise(function(resolve, reject){
      for(var i = 0; i < primaryKeys.length; i++){
        condition[primaryKeys[i]] = self[primaryKeys[i]]
      }

      if(options.transaction){
        query.transacting(options.transaction)
      }

      query.where(condition).delete().asCallback(function(err, a){
        self.logger.info(query.toString())

        if(err){
          return reject(new Store.SQLError(err))
        }

        resolve(true)
      })
    }, resolve, reject)
  }

}




/*
 * MODEL
 */
exports.model = {

  /**
   * Deletes all records which match the conditions. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   *
   * @class Model
   * @method deleteAll
   * @alias delete
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @this Collection
   *
   * @return {Model}
   */
  'delete': function(options, resolve, reject){
    return this.deleteAll(options, resolve, reject)
  },
  deleteAll: function(options, resolve, reject){
    const Store = __webpack_require__(0)

    var self = this.chain()

    if(typeof options === 'function'){
      reject = resolve
      resolve = options
      options = null
    }


    // callback = callback.bind(self);

    var query = self.query

    return self.promise(function(resolve, reject){
      if(options && options.transaction){
        query.transacting(options.transaction)
      }

      self.callInterceptors('beforeFind', [query], function(okay){
        if(okay){
          query.delete().asCallback(function(err, resp) {
            self.logger.info(query.toString())

            if(err){
              return reject(new Store.SQLError(err))
            }

            resolve(true)
          })
        }else{
          resolve(false, 0)
        }
      }, reject)
    }, resolve, reject)
  },





  /**
   * Loads all records at first and calls destroy on every single record. All hooks are fired and relations will be deleted if configured via options `dependent`
   *
   * @class Model
   * @method destroyAll
   * @alias destroy
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @this Collection
   *
   * @return {Model}
   */
  destroy: function(options, resolve, reject){
    return this.destroyAll(options, resolve, reject)
  },
  destroyAll: function(options, resolve, reject){
    var self = this.chain()

    if(typeof options === 'function'){
      reject = resolve
      resolve = options
      options = null
    }

    // callback = callback.bind(self);

    return self.promise(function(resolve, reject){
      if(options && options.transaction){
        self.transaction(options.transaction)
      }

      self.exec(function(records){
        var tmp = []
        var affected = 0

        self.each(function(record){
          tmp.push(function(next){
            record.destroy(options, function(success){
              if(success) affected += 1
              next()
            }, reject)
          })
        })

        if(tmp.length === 0){
          return resolve(true)
        }

        async.series(tmp, function(){
          resolve(tmp.length === affected)
        })
      }, reject)
    }, resolve, reject)
  }
}


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {


exports.store = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    Store.addExceptionType(function SQLError(error){
      Error.apply(this)
      this.message = error
    })
  }
}


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {


exports.definition = {
  mixinCallback: function(){
    const Store = __webpack_require__(0)

    var self = this

    this.onFind(function(query, data, next){
      if(data.result) return next()

      query.asCallback(function(err, resp) {
        self.logger.info(query.toString())

        if(err) data.error = new Store.SQLError(err)
        data.result = resp
        next()
      })
    })
  }
}


/*
 * MODEL
 */
exports.model = {

  getExecOptions: function(){
    return this.query
  },


  toSql: function(callback){
    var sql
    var query = this.query

    if(typeof callback !== 'function') return

    // make async?
    this.callInterceptors('beforeFind', [query], function(){
      sql = query.toString()

      if(process.env.NODE_ENV === 'test'){
        sql = sql.replace(/`/g, '"').replace(/'(\d+)'/g, '$1').replace(/ as /g, ' ')
      }

      callback(sql)
    })
  }

}


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)

/*
 * MODEL
 */
exports.model = {

  /**
   * Specify SQL group fields.
   * @class Model
   * @method group
   * @param {array} fields - The field names
   *
   *
   * @return {Model}
   */
  group: function(){
    var self = this.chain()

    var args = this.definition.store.utils.args(arguments)
    var fields = []
    fields = fields.concat.apply(fields, args) // flatten

    self.addInternal('group', fields)
    self.asRaw()

    return self
  },


  /**
   * SQL Having conditions
   * @class Model
   * @method having
   * @param {object} conditions - every key-value pair will be translated into a condition
   * @or
   * @param {array} conditions - The first element must be a condition string with optional placeholder (?), the following params will replace this placeholders
   *
   * @return {Model}
   */
  having: function(){
    const Utils = this.definition.store.utils
    var self = this.chain()
    var args = Utils.args(arguments)

    var conditions = Utils.sanitizeConditions(this, args)

    self.addInternal('having', conditions)

    return self
  }
}


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.beforeFind(function(query, next){
      var group = this.getInternal('group')
      var select = this.getInternal('select')
      var having = this.getInternal('having')
      var i

      if(group){
        if(!select){
          this.select(group)
        }

        for(i = 0; i < group.length; i++){
          var tmp = group[i]

          // check for function calls => don't escape them!
          if(tmp.match(/(\(|\))/)){
            tmp = self.store.connection.raw(tmp)
          }

          query.groupBy(tmp)
        }

        this.asJson()


        if(having){
          var calls = []
          var chain = this

          for(i = 0; i < having.length; i++){
            if(!having[i]) continue;

            (function(having){
              calls.push(function(done){
                query.having(function(){
                  var emptyfn = function(){}
                  if(having.type === 'hash'){
                    chain.callInterceptors('onHashCondition', [chain, having, this], emptyfn)
                  }else{
                    chain.callInterceptors('onRawCondition', [chain, having, this], emptyfn)
                  }
                })

                done()
              })
            })(having[i])
          }


          if(calls.length > 0){
            return async.parallel(calls, function(err){
              next(err)
            })
          }
        }
      }

      next()
    }, -45)
  }
}


/***/ }),
/* 64 */
/***/ (function(module, exports) {

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    /**
     * Will be called before every create. This hook will be called by `Record.save()`
     * @class Definition
     * @method beforeCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeCreate')

    /**
     * Will be called before every update. This hook will be called by `Record.save()`
     * @class Definition
     * @method beforeUpdate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeUpdate')

    /**
     * Will be called before every create or update. This hook will be called by `Record.save()`
     * @class Definition
     * @method beforeSave
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeSave')

    /**
     * Will be called before every destroy. This hook will be called by `Record.destroy()`
     * @class Definition
     * @method beforeDestroy
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeDestroy')




    /**
     * Will be called after every create. This hook will be called by `Record.save()`
     * @class Definition
     * @method afterCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('afterCreate')

    /**
     * Will be called after every update. This hook will be called by `Record.save()`
     * @class Definition
     * @method afterUpdate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('afterUpdate')

    /**
     * Will be called after every create or update. This hook will be called by `Record.save()`
     * @class Definition
     * @method afterSave
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('afterSave')

    /**
     * Will be called after every destroy. This hook will be called by `Record.destroy()`
     * @class Definition
     * @method afterDestroy
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('afterDestroy')



    /**
     * ## beforeFind
     * ### Priorities
     *
     * priority | file | responsibility
     * --- | --- | ---
     * -10 | includes | creates joins if necessary
     * -20 | joins | adds joins
     * -30 | aggregate_functions | adds `COUNT`, `SUM`, `MIN`, `MAX`
     * -40 | limit | adds limit and offset
     * -50 | select | maps table fields to numbers on joins
     * -60 | order | sets `ORDER BY`
     * -70 | conditions | created the `WHERE` clause
     * -80 | transaction | set a transaction
     *
     *
     *
     * ## afterFind
     * ### Priorities
     *
     * priority | file | responsibility
     * --- | --- | ---
     * 100 | select | on a join, it replaces all the fields (f0 ... fN) with the correct names
     * 90 | joins | on a join, it combines duplicate lines into one record - for the base and all it's subrecords
     * 80 | includes | creates additional queries for included relations
     * 70 | aggregate_functions | calls `asJson()` if any aggregate function was used
     * 60 | save | sets `__exists` attribute to `true` on all loaded records
     * 50 | collection | turns the json objects into records unless `asJson()` was called
     * 40 | limit | returns a single record instead of an array if limit was 1
     *
     * ## beforeCreate
     * ### Priorities
     *
     * priority | file | responsibility
     * --- | --- | ---
     * 100 | relations | saves related records
     *
     * @name Internal interceptors & Priorities
     * @private
     */
  }
}


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)


/*
 * MODEL
 */
exports.model = {
  /**
   * Joins one or multiple relations with the current model
   * @class Model
   * @method join
   * @param {string} relation - The relation name which should be joined.
   * @param {string} type - Optional join type (Allowed are `left`, `inner`, `outer` and `right`).
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  join: function(relations, type){
    const Utils = this.definition.store.utils
    var self = this.chain()

    // format of relations = ['JOIN ....', [args]]
    if(Array.isArray(relations) && typeof relations[0] === 'string' && relations[0].match(/join/i)){
      self.addInternal('joins', {
        type: 'custom',
        query: relations[0],
        args: relations[1] || []
      })
      return self
    }

    // format of relations = 'JOIN ...'
    if(typeof relations === 'string' && relations.match(/join/i)){
      self.addInternal('joins', {
        type: 'custom',
        query: relations,
        args: []
      })
      return self
    }

    if(typeof type === 'string' && ['left', 'inner', 'outer', 'right'].indexOf(type.toLowerCase()) !== -1){
      if(!Array.isArray(relations)){
        relations = [relations]
      }
    }else{
      relations = Utils.args(arguments)
      type = 'left'
    }

    relations = Utils.sanitizeRelations(self, relations)

    for(var i = 0; i < relations.length; i++){
      if(relations[i].relation.polymorph){
        throw new Error("Can't join polymorphic relations")
      }else{
        self.addInternal('joins', {
          relation: relations[i].relation,
          type: type,
          parent: relations[i].parent,
          name_tree: relations[i].name_tree,
          as: relations[i].as
        })
      }
    }

    return self
  },


  /**
   * Left joins one or multiple relations with the current model
   * @class Model
   * @method leftJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  leftJoin: function(){
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'left')
  },


  /**
   * Right joins one or multiple relations with the current model
   * @class Model
   * @method rightJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  rightJoin: function(){
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'right')
  },


  /**
   * Inner joins one or multiple relations with the current model
   * @class Model
   * @method innerJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  innerJoin: function(){
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'inner')
  },


  /**
   * Outer joins one or multiple relations with the current model
   * @class Model
   * @method outerJoin
   * @param {string} relation - The relation name which should be joined.
   * @or
   * @param {array} relations - Array of relation names
   * @or
   * @param {object} relations - For nested relational joins use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  outerJoin: function(){
    const Utils = this.definition.store.utils
    return this.join(Utils.args(arguments), 'outer')
  }
}



/*
 * DEFINITION
 */
exports.definition = {

  mixinCallback: function(){
    const Utils = this.store.utils
    var self = this

    this._autojoin = {}

    this.beforeFind(function(query, next){
      var i
      var conditions

      if(self._autojoin.enabled){
        conditions = this.getInternal('conditions') || []
        var relations = []
        for(i = 0; i < conditions.length; i++){
          if(conditions[i].name_tree.length > 0){
            if(self._autojoin.relations.length === 0 || self._autojoin.relations.indexOf(conditions[i].name_tree[conditions[i].name_tree.length - 1]) !== -1){
              relations.push(Utils.nameTreeToRelation(conditions[i].name_tree))
            }
          }
        }
        if(relations.length > 0){
          this.join(relations)
        }
      }


      var joins = this.getInternal('joins') || []
      var tableMap = {}
      var calls = []


      for(i = 0; i < joins.length; i++){
        if(joins[i].type === 'custom'){
          (function(sql, args){
            calls.push(function(done){
              query.joinRaw(sql, args)
              done()
            })
          })(joins[i].query, joins[i].args)
          continue
        }

        var relation = joins[i].relation
        var nameTree = joins[i].name_tree

        // if the same table is joined multiple times
        if(tableMap[nameTree.join('.')]){
          // remove it
          joins.splice(i, 1)
          i--
          // and continue with the next one
          continue
        }

        var tableName = relation.model.definition.table_name
        var name = Utils.nameTreeToNames(tableName, nameTree)

        var as = ''

        if(tableName !== name){
          as = ' AS ' + name
        }

        joins[i].name = name
        tableMap[nameTree.join('.')] = name

        // to support raw conditions and some others (like IN(), BETWEEN ...), we need to use a litte hack... knex only supports "attribute, operator, attribute"-style (on(), andOn(), orOn())
        conditions = Utils.sanitizeConditions(relation.model, Utils.clone(relation.conditions), nameTree, relation)
        var xquery = this.definition.store.connection('x')
        var _self = this;

        (function(conditions, xquery, join, tableName, as){
          calls.push(function(done){
            // generate the sql query and remove the `select * from x where` part...
            _self._applyCondtions(Utils.reverseConditions(conditions), xquery, function(){
              var sql = xquery.toString().replace(/select \* from .x. where /i, '')
              // now put the raw condition query into the join...
              query[join.type + 'Join'](tableName + as, self.store.connection.raw(sql))
              done()
            })
          })
        })(conditions, xquery, joins[i], tableName, as)
      }

      this.setInternal('table_map', tableMap)


      if(calls.length === 0){
        return next()
      }

      async.parallel(calls, function(err){
        next(err)
      })
    }, -20)



    this.afterFind(function(data){
      self.logger.trace('sql/joins', data)
      var records = data.result
      var joins = this.getInternal('joins') || []

      if(joins.length === 0) return true


      // Combines arrays of records and subrecords by their key
      var deepCombine = function(data, primaryKeys, depth){
        var keys = {}
        var records = []

        depth = depth || 0

        for(var r in data){
          var key = []

          if(primaryKeys.length > 0){
            for(var p in primaryKeys){
              key.push(data[r][primaryKeys[p]])
            }
            key = key.join(',')
          }else{
            key = r
          }

          if(!keys[key]){
            keys[key] = data[r]
            records.push(data[r])
          }else{
            for(var i in joins){
              var relation = joins[i].relation
              var names = joins[i].name_tree

              if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
                var sub = data[r][names[depth]]
                var ori = keys[key][names[depth]]

                if(ori && sub){
                  if(ori && !Array.isArray(ori)){
                    keys[key][names[depth]] = ori = [ori]
                  }

                  ori.push(sub)
                  keys[key][names[depth]] = deepCombine(ori, relation.model.definition.primary_keys, depth + 1)
                }
              }
            }
          }
        }

        return records
      }

      data.result = deepCombine(records, self.primary_keys)
      return true
    }, 90)
  },




  /**
   * Enable automatic joins on tables referenced in conditions
   * @class Definition
   * @method autoJoin
   * @param {object} options - Optional configuration options
   *
   * @options
   * @param {array} relations - Only use the given relations for the automatic joins.
   * @param {integer} limit - how many joins are allowed
   *
   * @return {Definition}
   */
  autoJoin: function(options){
    this._autojoin = options || {}
    this._autojoin.enabled = true
    this._autojoin.relations = this._autojoin.relations || []
    return this
  }
}


/***/ }),
/* 66 */
/***/ (function(module, exports) {


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.beforeFind(function(query){
      var limit = this.getInternal('limit')
      var offset = this.getInternal('offset')

      if(typeof limit === 'number'){
        query.limit(limit)
      }

      if(offset && offset > 0){
        query.offset(offset)
      }

      return true
    }, -40)
  }
}


/***/ }),
/* 67 */
/***/ (function(module, exports) {

/*
 * MODEL
 */
exports.model = {
  /**
   * Set a sort order
   * @class Model
   * @method order
   * @param {array} columns - Array of field fro the sort.
   * @param {boolean} desc - Optional: Set to `true` to order descent
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  order: function(columns, desc){
    var self = this.chain()

    if(columns){
      if(typeof desc === 'boolean'){
        if(!Array.isArray(columns)) columns = [columns]
      }else{
        columns = [].concat.apply([], this.definition.store.utils.args(arguments))
        desc = false
      }

      for(var i in columns){
        self.addInternal('order', {column: columns[i], order: desc ? 'DESC' : 'ASC'})
      }
    }else{
      self.clearInternal('order')
    }

    return self
  },


  sort: function(){
    return this.order.apply(this, arguments)
  }
}



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.beforeFind(function(query){
      var order = this.getInternal('order')

      // check if there was an aggregate function called
      var aggFns = ['count', 'sum', 'min', 'max', 'avg']
      var i

      for(i in aggFns){
        if(this.getInternal(aggFns[i])){
          return
        }
      }

      if(order){
        for(i in order){
          var attribute = order[i].column
          var tmp = attribute.split('.')

          if(tmp.length > 1){
            if(this.definition.attributes[tmp[0]]){
              if(typeof this.definition.attributes[tmp[0]].type.sorter === 'function'){
                attribute = this.definition.attributes[tmp[0]].type.sorter.call(this, attribute)
              }
            }
          }

          query.orderBy(attribute, order[i].order)
        }
      }

      return true
    }, -60)
  }
}


/***/ }),
/* 68 */
/***/ (function(module, exports) {

/*
 * DEFINITION
 */
exports.definition = {
  query: function(){
    var connection = this.store.connection
    return connection(this.table_name)
  }
}


exports.chain = {
  mixinCallback: function(){
    var self = this

    this.__defineGetter__('query', function(){
      var connection = this.definition.store.connection
      if(!connection) return


      var query = self.getInternal('query')

      if(!query){
        query = connection(self.definition.table_name)
        self.setInternal('query', query)
      }

      return query
    })
  }
}


/***/ }),
/* 69 */
/***/ (function(module, exports) {

/*
 * DEFINITION
 */
exports.model = {
  /**
  * execute raw sql
  * @class Model
  * @method raw
  * @param {string} sql - The raw sql query.
  * @param {array} attrs - Query attributes.
  * @param {function} callback - The callback.
  *
  * @see Model.exec
  *
  * @return {Model}
  */
  raw: function(sql, attrs, callback){
    var promise = this.definition.store.connection.raw(sql, attrs)

    if(typeof callback === 'function'){
      promise.then(callback)
    }

    return promise
  }
}


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

const async = __webpack_require__(1)


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    var beforeHook = function(record, transaction, next){
      record = this
      var tmp = []
      var i

      for(i in self.relations){
        var relation = self.relations[i]
        if(relation.type.through) continue

        if(relation.type === 'belongs_to' && !relation.through){
          if(record[relation.name] && record[relation.name].hasChanges()){
            (function(relation){
              var validates = true
              if(relation.validates === false) validates = false
              if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(record[relation.name].__exists ? 'update' : 'destroy') !== -1

              tmp.push(function(done){
                record[relation.name].save({transaction: transaction}, function(okay){
                  if(okay || !validates){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute && !record.hasChanged(relation.conditions[base].attribute)){ // check if the relation id was manually changed
                        record[relation.conditions[base].attribute] = this[base]
                      }
                    }

                    return done()
                  }
                  done('STOP')
                }, done)
              })
            })(relation)
          }
        }



        if(relation.type === 'belongs_to_many' && !relation.through){
          if(record.relations[relation.name] && record.relations[relation.name].length > 0){
            for(i = 0; i < record[relation.name].length; i++){
              if(record[relation.name][i] && record[relation.name][i].hasChanges()){
                (function(relation, subrecord){
                  var validates = true
                  if(relation.validates === false) validates = false
                  if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(subrecord.__exists ? 'update' : 'destroy') !== -1

                  tmp.push(function(done){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute){
                        subrecord[base] = record[relation.conditions[base].attribute]
                      }
                    }

                    subrecord.save({transaction: transaction}, function(okay){
                      if(okay || !validates){
                        return done()
                      }
                      done('STOP')
                    }, done)
                  })
                })(relation, record[relation.name][i])
              }
            }
          }
        }
      }

      if(tmp.length === 0){
        return next(true)
      }

      async.parallel(tmp, function(err){
        if(err === 'STOP') err = false
        next(err)
      })
    }


    var afterHook = function(record, transaction, next){
      var tmp = []
      var thisRecord = this

      for(var i in self.relations){
        var relation = self.relations[i]
        if(relation.type.through) continue

        if(relation.type === 'has_many' && !relation.through){
          if(this.relations[relation.name] && this.relations[relation.name].length > 0){
            for(var j = 0; j < this[relation.name].length; j++){
              if(this[relation.name][j] && this[relation.name][j].hasChanges()){
                (function(relation, subrecord){
                  var validates = true
                  if(relation.validates === false) validates = false
                  if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(subrecord.__exists ? 'update' : 'destroy') !== -1

                  tmp.push(function(done){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute){
                        subrecord[base] = record[relation.conditions[base].attribute]
                      }
                    }

                    subrecord.save({transaction: transaction}, function(okay){
                      if(okay || !validates){
                        return done()
                      }
                      done('STOP')
                    }, done)
                  })
                })(relation, this[relation.name][j])
              }
            }
          }
        }


        if(relation.type === 'has_one' && !relation.through){
          if(this[relation.name] && this[relation.name].hasChanges()){
            (function(relation){
              var validates = true
              if(relation.validates === false) validates = false
              if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(thisRecord[relation.name].__exists ? 'update' : 'destroy') !== -1

              tmp.push(function(done){
                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    thisRecord[relation.name][base] = record[relation.conditions[base].attribute]
                  }
                }

                thisRecord[relation.name].save({transaction: transaction, commit: false}, function(okay){
                  if(okay || !validates){
                    return done()
                  }
                  done('STOP')
                }, done)
              })
            })(relation)
          }
        }
      }

      if(tmp.length === 0){
        return next(true)
      }

      async.series(tmp, function(err){
        if(err === 'STOP') err = false
        next(err)
      })
    }

    // TODO: use beforeSave and afterSave !?
    this.beforeCreate(beforeHook, 100)
    this.beforeUpdate(beforeHook, 100)
    this.afterCreate(afterHook, 100)
    this.afterUpdate(afterHook, 100)





    this.afterDestroy(function(record, transaction, next){
      var tmp = []

      for(var i in self.relations){
        var relation = self.relations[i];

        (function(relation){
          var validates = true
          if(relation.validates === false) validates = false
          if(Array.isArray(relation.validates)) validates = relation.validates.indexOf('destroy') !== -1

          if(relation.dependent === 'destroy' || relation.dependent === 'delete'){
            tmp.push(function(done){
              if(relation.type === 'has_many'){
                record[relation.name][relation.dependent]({transaction: transaction, rollback: false, commit: false}, function(success){
                  if(!success && validates) return done('STOP')
                  done()
                }, done)
              }else{
                var conditions = {}

                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    conditions[base] = record[relation.conditions[base].attribute]
                  }else{
                    conditions[base] = relation.conditions[base]
                  }
                }

                relation.model.where(conditions).transaction(transaction).limit(1).exec(function(subrecord){
                  if(subrecord){
                    subrecord[relation.dependent]({transaction: transaction, rollback: false, commit: false}, function(success){
                      if(!success && validates) return done('STOP')
                      done()
                    }, done)
                  }else{
                    done()
                  }
                })
              }
            })
          }

          if(relation.dependent === 'nullify'){
            tmp.push(function(done){
              if(relation.type === 'has_many' || relation.type === 'has_one'){ // TODO: add hasOne as well!
                var attrs = {}

                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    attrs[base] = null
                  }
                }

                record[relation.name].updateAll(attrs, {transaction: transaction, rollback: false, commit: false}, function(success){
                  if(!success && validates) return done('STOP')
                  done()
                }, done)
              }
            })
          }
        })(relation)
      }

      if(tmp.length === 0){
        return next(true)
      }

      async.series(tmp, function(err){
        if(err === 'STOP') err = false
        next(err)
      })
    }, 100)
  }
}


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {


/*
 * RECORD
 */
exports.record = {

  /**
   * Save the current record
   * @class Record
   * @method save
   * @param {function} callback - The save callback
   *
   * @callback
   * @param {boolean} result - will be true if the save was successful
   * @this Record
   *
   * @return {Record}
   */
  save: function(options, resolve, reject){
    var self = this

    if(typeof options === 'function'){
      reject = resolve
      resolve = options
      options = {}
    }

    options = options || {}

    // callback = callback.bind(this);

    return self.promise(function(resolve, reject){
      self.validate(function(valid){
        if(valid){
          self._create_or_update(options, resolve, reject)
        }else{
          resolve(false)
        }
      })
    }, resolve, reject)
  },




  _create_or_update: function(options, resolve, reject){
    var self = this

    this.transaction(options, function(transaction){
      self.callInterceptors('beforeSave', [self, transaction], function(okay){
        if(okay){
          if(self.__exists){
            self._update(options, resolve, reject)
          }else{
            self._create(options, resolve, reject)
          }
        }else{
          if(options.rollback !== false){
            transaction.rollback('beforeSave')
          }
          resolve(false)
        }
      }, reject)
    })
  },




  _update: function(options, resolve, reject){
    const Store = __webpack_require__(0)

    var self = this
    var query = this.definition.query()
    var primaryKeys = this.definition.primary_keys
    var condition = {}

    for(var i = 0; i < primaryKeys.length; i++){
      condition[primaryKeys[i]] = this[primaryKeys[i]]
    }


    this.callInterceptors('beforeUpdate', [self, options.transaction], function(okay){
      if(okay){
        var values = {}
        var changes = self.getChangedValues()
        var hasChanges = false

        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name]

          if(attr.persistent && changes.hasOwnProperty(name)){
            // if attribute has `getChangedValues` (e.g. composite type)
            if(changes[name] && typeof changes[name].getChangedValues === 'function' && changes[name].definition){
              var subchanges = changes[name].getChangedValues()
              for(var subname in subchanges){
                if(subchanges.hasOwnProperty(subname)){
                  values[name + '.' + subname] = changes[name].definition.cast(subname, subchanges[subname], 'write', changes[name])
                  hasChanges = true
                }
              }
            }else{
              values[name] = self.model.definition.cast(name, changes[name], 'write', self)
              hasChanges = true
            }
          }
        }

        var afterUpdate = function(){
          self.callInterceptors('afterUpdate', [self, options.transaction], function(okay){
            if(okay){
              self.callInterceptors('afterSave', [self, options.transaction], function(okay){
                if(okay){
                  self.changes = {}

                  if(options.commit !== false){
                    options.transaction.commit()
                    options.transaction_promise.then(function(){
                      resolve(true)
                    })
                  }else{
                    resolve(true)
                  }
                }else{
                  if(options.rollback !== false){
                    options.transaction.rollback('afterSave')
                  }
                  resolve(false)
                }
              })
            }else{
              if(options.rollback !== false){
                options.transaction.rollback('afterUpdate')
              }
              resolve(false)
            }
          })
        }

        if(hasChanges){
          query.transacting(options.transaction).where(condition).update(values).asCallback(function(err, result){
            self.logger.info(query.toString())

            if(err){
              options.transaction.rollback('exception')
              return reject(new Store.SQLError(err))
            }
            afterUpdate()
          })
        }else{
          // call afterUpdate hook even there was nothing to save for the current record!
          afterUpdate()
        }
      }else{
        if(options.rollback !== false){
          options.transaction.rollback('beforeUpdate')
        }
        resolve(false)
      }
    }, reject)
  },





  _create: function(options, resolve, reject){
    const Store = __webpack_require__(0)

    var self = this
    var query = this.definition.query()
    // TODO multiple primary keys?!?!
    var primaryKeys = this.definition.primary_keys
    var primaryKey = primaryKeys[0]

    this.callInterceptors('beforeCreate', [self, options.transaction], function(okay){
      if(okay){
        var values = {}
        var changes = self.getChangedValues()

        for(var name in self.model.definition.attributes){
          var attr = self.model.definition.attributes[name]

          if(attr.persistent && changes.hasOwnProperty(name)){
            values[name] = self.model.definition.cast(name, changes[name], 'write', self)
          }
        }


        query.transacting(options.transaction).returning(primaryKey).insert(values).asCallback(function(err, result){
          self.logger.info(query.toString())

          if(err){
            options.transaction.rollback('exception') // TODO!
            return reject(new Store.SQLError(err))
          }

          var idTmp = {}
          idTmp[primaryKey] = result[0]

          self.__exists = true
          self.set(idTmp, 'read')

          self.callInterceptors('afterCreate', [self, options.transaction], function(okay){
            if(okay){
              self.callInterceptors('afterSave', [self, options.transaction], function(okay){
                if(okay){
                  self.changes = {}

                  if(options.commit !== false){
                    options.transaction.commit()
                    options.transaction_promise.then(function(){
                      resolve(true)
                    })
                  }else{
                    resolve(true)
                  }
                }else{
                  if(options.rollback !== false){
                    options.transaction.rollback('afterSave')
                  }
                  resolve(false)
                }
              })
            }else{
              if(options.rollback !== false){
                options.transaction.rollback('afterCreate')
              }
              resolve(false)
            }
          })
        })
      }else{
        if(options.rollback !== false){
          options.transaction.rollback('beforeCreate')
        }
        resolve(false)
      }
    }, reject)
  }
}




exports.model = {
  /**
   * Updates all records which match the conditions. beforeSave, afterSave, beforeUpdate and afterUpdate want be called!
   * @class Model
   * @method updateAll
   * @alias update
   *
   * @callback
   * @param {boolean} success - Returns true if the update was successfull
   * @param {integer} affected_records - The number of affected records
   * @this Collection
   *
   * @return {Promise}
   */
  update: function(attributes, options, resolve, reject){
    return this.updateAll(attributes, options, resolve, reject)
  },
  updateAll: function(attributes, options, resolve, reject){
    const Store = __webpack_require__(0)

    var self = this.chain()

    if(typeof options === 'function'){
      reject = resolve
      resolve = options
      options = null
    }

    // callback = callback.bind(self);

    var query = self.query

    return self.promise(function(resolve, reject){
      if(options && options.transaction){
        query.transacting(options.transaction)
      }

      self.callInterceptors('beforeFind', [query], function(okay){
        if(okay){
          query.update(attributes).asCallback(function(err, resp) {
            self.logger.info(query.toString())

            if(err){
              return reject(new Store.SQLError(err))
            }else{
              resolve(true)
            }
          })
        }else{
          resolve(false)
        }
      }, reject)
    }, resolve, reject)
  }
}


/***/ }),
/* 72 */
/***/ (function(module, exports) {


/*
 * MODEL
 */
exports.model = {

  /**
   * Specify SQL select fields. Default: *
   * @class Model
   * @method select
   * @param {array} fields - The field names
   *
   *
   * @return {Model}
   */
  select: function(){
    var self = this.chain()

    var args = this.definition.store.utils.args(arguments)
    var fields = []
    fields = fields.concat.apply(fields, args) // flatten

    self.addInternal('select', fields)

    return self
  }
}


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.beforeFind(function(query){
      var custom = this.getInternal('select')
      var joins = this.getInternal('joins') || []
      var select = []
      var selectMap = {}
      var index = 0
      var star = true
      var name
      var i


      // check if there was an aggregate function was called
      var aggFns = ['count', 'sum', 'min', 'max', 'avg']

      for(i in aggFns){
        if(this.getInternal(aggFns[i])){
          return
        }
      }


      if(custom){
        select = custom
        selectMap = null
        star = false

        var asJson = joins.length > 0

        for(i = 0; i < select.length; i++){
          // check for function calls => don't escape them!
          if(select[i].match(/(\(|\))/)){
            select[i] = self.store.connection.raw(select[i])
            asJson = true
          }
        }

        if(asJson){
          this.asJson()
          this.asRaw()
        }else{
          this.setInternal('allowed_attributes', select)
        }
      }else{
        if(joins.length > 0){
          for(name in self.attributes){
            if(self.attributes[name].persistent){
              select.push(self.table_name + '.' + name + ' AS f' + index)
              selectMap['f' + index++] = name
            }
          }

          for(i in joins){
            if(joins[i].type === 'custom') continue
            var relation = joins[i].relation
            var pre = joins[i].name_tree.join('.')

            if(joins[i].as){
              pre = joins[i].as.join('.')
            }

            for(name in relation.model.definition.attributes){
              if(relation.model.definition.attributes[name].persistent){
                select.push(joins[i].name + '.' + name + ' AS f' + index)
                selectMap['f' + index++] = pre + '.' + name
              }
            }
            star = false
          }
        }
      }






      if(!star){
        query.select(select)
        this.setInternal('select_map', selectMap)
      }

      return true
    }, -50)




    this.afterFind(function(data){
      self.logger.trace('sql/select', data)
      data = data.result
      var selectMap = this.getInternal('select_map')

      if(selectMap){
        for(var i = 0; i < data.length; i++){
          var r = {}
          for(var attr in data[i]){
            if(data[i].hasOwnProperty(attr)){
              if(data[i][attr] == null) continue // if value is null
              if(!selectMap[attr]) continue // if there is a value which was not in the original select (?!)
              var names = selectMap[attr].split('.')
              var tmp = r
              for(var n = 0; n < names.length; n++){
                if(n < names.length - 1){
                  tmp[names[n]] = tmp = tmp[names[n]] || {}
                }else{
                  tmp[names[n]] = data[i][attr]
                }
              }
            }
          }
          data[i] = r
        }
      }
    }, 100)
  }
}


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

const inflection = __webpack_require__(3)

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.table_name = inflection.underscore(inflection.pluralize(this.model_name))

    if(this.store.config.inflection && this.store.config.inflection[this.table_name]){
      this.table_name = this.store.config.inflection[this.table_name]
    }
  },

  getName: function(){
    return this.table_name
  }
}


/*
 * STORE
 */
exports.store = {
  getByTableName: function(tableName){
    for(var i in this.models){
      if(this.models[i].definition.table_name === tableName){
        return this.models[i]
      }
    }
  }
}


/***/ }),
/* 74 */
/***/ (function(module, exports) {

/*
 * MODEL
 */
exports.model = {
  /**
   * Add the current query into a transaction
   *
   * @class Model
   * @method transaction
   * @param {object} transaction - The transaction object
   *
   * @return {Collection}
   */
  transaction: function(transaction){
    var self = this.chain()

    self.setInternal('transaction', transaction)

    return self
  }
}


/*
 * RECORD
 */
exports.record = {
  /**
   * TODO:... write documentation
   *
   * @class Record
   * @method transaction
   * @param {object} transaction - The transaction object
   *
   */
  transaction: function(options, callback){
    var self = this

    if(typeof options === 'function'){
      callback = options
      options = {}
    }

    if(options.transaction){
      options.commit = false
      callback(options.transaction)
    }else{
      options.transaction_promise = this.definition.store.connection.transaction(function(transaction){
        options.transaction = transaction
        callback(transaction)
        self.logger.info('commit')
      }).catch(function(e){
        // TODO: do something with e.g. 'afterSave' rollback message!?!
        self.logger.info('rollback')
      })
    }
  }
}





/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.beforeFind(function(query){
      var transaction = this.getInternal('transaction')

      if(transaction){
        query.transacting(transaction)
      }

      return true
    }, -80)
  }
}


/***/ }),
/* 75 */
/***/ (function(module, exports) {

exports.utils = {

  getAttributeName: function(chain, condition, escape){
    var table = condition.model.definition.table_name
    var nameTree = condition.name_tree
    // var table_map = chain.getInternal('table_map');

    if(nameTree.length > 0){
      /* if(table_map){
        if(table_map[name_tree.join('.')]) table = table_map[name_tree.join('.')];
      }else{ */
      table = this.nameTreeToNames(table, nameTree)
      // }
    }

    var result = table + '.' + condition.attribute

    if(escape){
      result = chain.query.client.formatter()._wrapString(result)
    }

    return result
  }

}


/***/ }),
/* 76 */
/***/ (function(module, exports) {

/*
 * DEFINITION
 */
exports.definition = {
  /**
   * This validator checks the uniqness of the given field`s value before save.
   * @class Definition
   * @method validatesUniquenessOf
   * @param {array} fields - The fields to validate
   * @or
   * @param {string} fields - The field to validate
   * @param {object} options - Optional: Options hash
   *
   * @options
   * @param {string} scope - Set a scope column
   *
   * @return {Definition}
   */
  validatesUniquenessOf: function(){
    var args = this.store.utils.args(arguments)
    if(args.length > 1 && typeof args[1] === 'string'){
      return this.validateFieldsHelper(args, this.validatesUniquenessOf)
    }

    var field = args[0]
    var options = args[1] || {}
    var self = this

    if(Array.isArray(field)){
      return this.validateFieldsHelper(field, [options], this.validatesUniquenessOf)
    }

    return this.validates(field, function(next){
      var record = this
      var primaryKeys = self.primary_keys
      var condition = {}
      var i

      if(this[field] === null){
        return next(true)
      }

      if(!this.hasChanged(field)){
        return next(true)
      }

      condition[field] = self.cast(field, this[field], 'write', this)

      for(i = 0; i < primaryKeys.length; i++){
        if(this[primaryKeys[i]]){
          condition[primaryKeys[i] + '_not'] = this[primaryKeys[i]]
        }
      }

      if(options.scope){
        if(!Array.isArray(options.scope)) options.scope = [options.scope]

        for(i = 0; i < options.scope.length; i++){
          condition[options.scope[i]] = this[options.scope[i]]
        }
      }


      self.model.count().where(condition).exec(function(result){
        if(result > 0){
          record.errors.add(field, 'not uniq')
          return next(false)
        }
        next(true)
      })
    })
  }
}


/***/ }),
/* 77 */
/***/ (function(module, exports) {

exports.migration = {
  addColumn: function(table, columnFn){
    var self = this
    var fields = this.fields = []

    if(typeof columnFn === 'function'){
      columnFn.call(self)
    }


    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        for(var i = 0; i < fields.length; i++){
          if(typeof fields[i] === 'function'){
            fields[i].call(self, table)
          }
        }
      }).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  },


  renameColumn: function(table, from, to){
    var self = this
    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        table.renameColumn(from, to)
      }).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  },


  removeColumn: function(table, name){
    var self = this

    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        if(Array.isArray(name)){
          table.dropColumns.apply(table, name)
        }else{
          table.dropColumn(name)
        }
      }).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  },




  setColumnOptions: function(column, options){
    if(typeof column === 'string') throw new Error('first param needs to be a column object')

    if(options.primary){
      column.primary()
    }

    if(options.unique){
      column.unique()
    }

    if(options.default !== undefined){
      column.defaultTo(options.default)
    }

    if(options.notnull || options.not_null){
      column.notNullable()
    }
  }
}


/***/ }),
/* 78 */
/***/ (function(module, exports) {

exports.migration = {

  mixinCallback: function(){
    var self = this

    for(var i in this.store.attribute_types){
      if(this.store.attribute_types.hasOwnProperty(i)){
        var type = this.store.attribute_types[i]

        if(!type.migration) continue
        if(!Array.isArray(type.migration)) type.migration = [type.migration]

        for(var d = 0; d < type.migration.length; d++){
          if(typeof type.migration[d] === 'object'){
            for(var name in type.migration[d]){
              self[name] = self._addColumnTypeFn(type.migration[d][name])
            }
          }else{
            self[type.migration[d]] = self._addColumnTypeFn(type.migration[d])
          }
        }
      }
    }
  },



  _defineColumnTypeFn: function(type, name, options){
    var self = this
    return function(table){
      if(type === 'datetime'){ // TODO: better solution?!
        type = 'dateTime'
      }

      var fn = table[type]
      var column

      if(typeof fn === 'function'){
        column = fn.call(table, name)
      }else{
        column = table.specificType(name, type)
      }

      self.setColumnOptions(column, options)
    }
  },

  _addColumnTypeFn: function(type){
    var self = this
    return function(table, name, options){
      if(typeof table === 'string' && typeof name === 'string'){
        options = options || {}

        // add column to existing table
        self.addColumn(table, self._defineColumnTypeFn(type, name, options))
      }else{
        options = name || {}
        name = table

        // inside a createTable()
        self.fields.push(self._defineColumnTypeFn(type, name, options))
      }
    }
  },



  increments: function(){
    this._addColumnTypeFn('increments').apply(this, arguments)
  }

}


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

const path = __webpack_require__(7)
const async = __webpack_require__(1)

exports.definition = {
  mixinCallback: function(){
    var store = this.store

    this.use(function(next){
      if(!store.migrations_running){
        store.runMigrations()
      }

      // put that one after loadMigrations to finish the middleware without any async stuff if there is no connection - or migration
      if(store.migrations_finished){
        return next()
      }

      store.once('migrations_finished', next)
    }, 100)
  }
}



exports.store = {
  mixinCallback: function(){
    this.migration_table = this.config.migration_table || 'openrecord_migrations'
    this.migrations = []

    if(this.config.migrations){
      this.loadMigrations(this.config.migrations)
    }
  },


  Migration: function(name, fn){
    this.migrations.push({name: name, fn: fn})
  },



  loadMigrations: function(modules){
    var migrations = this.utils.getModules(modules)

    for(var fullpath in migrations){
      if(migrations.hasOwnProperty(fullpath) && typeof migrations[fullpath] === 'function'){
        var migrationName = path.basename(fullpath, path.extname(fullpath))

        this.Migration(migrationName, migrations[fullpath])
      }
    }
  },



  runMigrations: function(){
    this.migrations_running = true

    if(!this.connection || this.migrations.length === 0){
      this.migrations_finished = true
      this.migrations_running = false
      return
    }

    var self = this
    this.loadMigrationHistory(function(error, finishedMigrations){
      if(error) return this.store.handleException(error)

      self.runMissingMigrations(finishedMigrations, function(){
        self.migrations_finished = true
        self.migrations_running = false
        self.emit('migrations_finished')
      })
    })
  },



  loadMigrationHistory: function(callback){
    var self = this

    this.connection.schema.hasTable(this.migration_table).then(function(exists){
      if(exists){
        self.connection(self.migration_table).then(function(result){
          var names = []

          for(var i = 0; i < result.length; i++){
            names.push(result[i].name)
          }

          callback(null, names)
        })
      }else{
        self.connection.schema.createTable(self.migration_table, function(table){
          table.string('name')
        }).then(function(){
          callback(null, [])
        }).catch(callback)
      }
    })
  },



  runMissingMigrations: function(finishedMigrations, callback){
    var missing = []
    var self = this

    var Migration = {connection: this.connection, store: this}
    this.utils.mixin(Migration, this.mixinPaths, {only: 'migration'})
    this.utils.mixinCallbacks(Migration, {})


    // Migrations are handled in series
    // First the migration method will be called
    // for every operation a new queue item will be added
    // after that, we'll execute the queue
    for(var i = 0; i < this.migrations.length; i++){
      if(finishedMigrations.indexOf(this.migrations[i].name) === -1){
        (function(fn, name){
          missing.push(function(done){
            var queue = []
            Migration.queue = queue

            try{
              Migration.startTransaction()
              fn.call(Migration)
              Migration.commit()

              // Run the operation queue
              async.series(queue, function(err){
                if(err) return done(err)
                self.connection(self.migration_table).insert({name: name}).then(function(){
                  done()
                }, function(err){
                  done(err)
                })
              })
            }catch(e){
              done(e)
            }
          })
        })(this.migrations[i].fn, this.migrations[i].name)
      }
    }

    async.series(missing, function(err){
      if(err){
        Migration.rollback()
        console.log('ROLLBACK', err)
      }
      callback()
    })
  }

}


/***/ }),
/* 80 */
/***/ (function(module, exports) {

exports.migration = {
  polymorph: function(name){
    this.integer(name + '_id')
    this.string(name + '_type')
  }
}


/***/ }),
/* 81 */
/***/ (function(module, exports) {

exports.migration = {

  raw: function(sql){
    var self = this

    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.raw(sql).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  }
}


/***/ }),
/* 82 */
/***/ (function(module, exports) {

exports.migration = {
  run: function(fn){
    var self = this
    this.queue.push(function(next){
      fn.call(self.store, next)
      if(fn.length === 0){
        next()
      }
    })

    return this
  }
}


/***/ }),
/* 83 */
/***/ (function(module, exports) {

exports.migration = {
  seed: function(fn){
    return this.run(function(next){
      next()
      this.use(fn)
    })
  }
}


/***/ }),
/* 84 */
/***/ (function(module, exports) {

exports.migration = {

  createTable: function(name, options, fn){
    var self = this
    var fields = []

    this.fields = fields

    if(typeof options === 'function'){
      fn = options
      options = {}
    }

    options = options || {}

    // add the ide column, if not disabled
    if(options.id !== false){
      this.increments('id', {
        primary: true
      })
    }

    // Call custom createTable() method
    if(typeof fn === 'function'){
      fn.call(this)
    }

    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.createTable(name, function(table){
        for(var i = 0; i < fields.length; i++){
          if(typeof fields[i] === 'function'){
            fields[i].call(self, table)
          }
        }
      }).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  },





  renameTable: function(from, to){
    var self = this

    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.renameTable(from, to).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  },




  removeTable: function(table){
    var self = this

    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.dropTableIfExists(table).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  }
}


/***/ }),
/* 85 */
/***/ (function(module, exports) {

exports.migration = {
  startTransaction: function(){
    // var self = this

    // knex currently does not support transactions on the schema builders
    /*
    this.queue.push(function(next){
      self.connection.transaction(function(transaction){
        console.log('STARTED');
        self.transaction = transaction;
        next();
      }).catch(function(e){
        //TODO: do something with rollback message!?!
      });
    });
    */

    return this
  },



  commit: function(){
    // var self = this

    /*
    this.queue.push(function(next){
      console.log('COMMIT');
      self.transaction.commit(next);
    });
    */

    return this
  },


  // Rollback is instant
  rollback: function(msg){
    if(this.transaction){
      this.transaction.rollback(msg)
    }
  }
}


/***/ }),
/* 86 */
/***/ (function(module, exports) {


exports.migration = {
  nestedSet: function(){
    this.integer('lft')
    this.integer('rgt')
    this.integer('depth')
    this.integer('parent_id', {default: 0})
  }
}


exports.definition = {

  nestedSet: function(){
    var self = this

    this.attribute('leaf', Boolean, {
      writable: false,
      default: true
    })

    this.hasMany('children', {model: this.getName(), foreign_key: 'parent_id'})
    this.belongsTo('parent', {model: this.getName()})

    this.scope('byLevel', function(level){
      this.where({depth: level})
    })

    this.scope('rootOnly', function(){
      this.byLevel(0)
    })

    this.scope('withChildren', function(){
      this.include('children')
    })

    this.scope('withAllChildren', function(depth){
      if(depth === 1){
        this.withChildren()
      }else{
        this.setInternal('nested_set_with_children_depth', depth)
        this.setInternal('nested_set_with_children', true)
      }
    })



    // helper for withAllChildren
    this.afterFind(function(data, done){
      var withChildren = this.getInternal('nested_set_with_children')
      var depth = this.getInternal('nested_set_with_children_depth')
      var records = data.result || []
      var record
      var i

      if(!Array.isArray(records)) records = [records]

      // set leaf attribute
      for(i = 0; i < records.length; i++){
        record = records[i]
        if(record.lft !== record.rgt - 1){
          record.leaf = false
        }
      }


      if(withChildren){
        if(records && !Array.isArray(records)) records = [records]

        var ranges = []
        var rangeRecords = {}

        // loop over records and get it's ranges
        for(i = 0; i < records.length; i++){
          record = records[i]

          if(record.rgt - record.lft > 1){
            ranges.push([record.lft + 1, record.rgt - 1])
            rangeRecords[record.lft] = record
          }
        }

        if(ranges.length > 0){
          var depthConditions = null

          if(depth) depthConditions = {depth_lte: depth}

          // find all records within that ranges
          return this.model.where({lft_between: ranges}).where(depthConditions).order('lft').exec(function(children){
            for(var i = 0; i < children.length; i++){
              var child = children[i]

              // add all child records to the associated parents. based on lft and rgt
              if(rangeRecords[child.lft - 1]){
                var parent = rangeRecords[child.lft - 1]
                if(parent){
                  parent.children = parent.children || []
                  parent.children.push(child)
                  rangeRecords[child.lft] = child

                  delete rangeRecords[child.lft - 1]
                  rangeRecords[child.rgt] = parent
                }
              }
            }

            done()
          }).catch(done)
        }
      }

      done()
    })



    this.beforeCreate(function(record, transaction, done){
      if(record.parent_id){
        // search the parent node
        return self.model.find(record.parent_id).transaction(transaction).exec(function(parent){
          if(parent){
            return self.query().transacting(transaction).where('rgt', '>=', parent.rgt).increment('rgt', 2).then(function(){
              return self.query().transacting(transaction).where('lft', '>', parent.rgt).increment('lft', 2)
            }).then(function(){
              record.lft = parent.rgt // values before the update - see above
              record.rgt = parent.rgt + 1
              record.depth = parent.depth + 1
              done()
            })
          }
          done()
        })
      }else{
        // new root node!
        return self.model.rootOnly().order('rgt', true).limit(1).transaction(transaction).exec(function(rootSibling){
          if(rootSibling){
            record.lft = rootSibling.rgt + 1
            record.rgt = rootSibling.rgt + 2
          }else{
            record.lft = 1
            record.rgt = 2
          }
          record.depth = 0
          done()
        })
      }
    })


    // http://falsinsoft.blogspot.co.at/2013/01/tree-in-sql-database-nested-set-model.html

    this.beforeUpdate(function(record, transaction, done){
      if(record.hasChanged('parent_id')){
        if(record.parent_id){
          return self.model.find(record.parent_id).transaction(transaction).exec(function(parent){
            if(parent){
              record.__parent_rgt = parent.rgt // we need that in the afterUpdate
              record.__depth_diff = record.depth - parent.depth - 1 // we need that in the afterUpdate

              record.depth = parent.depth + 1 // only set the depth - the rest will be done by afterUpdate

              done()
            }else{
              done("can't find parent node with id " + record.parent_id)
            }
          })
        }else{
          // change to a root node
          return self.model.rootOnly().order('rgt', true).limit(1).transaction(transaction).exec(function(rootSibling){
            if(rootSibling){
              record.__parent_rgt = rootSibling.rgt + 1
            }else{
              record.__parent_rgt = record.rgt - record.lft
            }

            record.__depth_diff = record.depth
            record.depth = 0
            done()
          })
        }
      }
      done()
    })


    // TODO: move afterUpdate into beforeUpdate...
    // changes all nodes if a record got a new parent
    this.afterUpdate(function(record, transaction, done){
      if(record.hasChanged('parent_id')){
        var lft = record.lft
        var rgt = record.rgt
        var parentRgt = record.__parent_rgt
        var depthDiff = record.__depth_diff

        var raw = self.store.connection.raw

        var rgtCol = record.definition.store.connection.client.wrapIdentifier('rgt')
        var lftCol = record.definition.store.connection.client.wrapIdentifier('lft')
        var depthCol = record.definition.store.connection.client.wrapIdentifier('depth')

        if(record.__parent_rgt < lft){
          // move the records to the "left"
          self.query().transacting(transaction)
          .whereBetween('lft', [parentRgt, rgt]).orWhereBetween('rgt', [parentRgt, rgt])
          .update({
            'rgt': raw([
              rgtCol + ' + CASE WHEN',
              rgtCol + ' BETWEEN', lft, 'AND', rgt, // if it's the current record or one of it's children
              'THEN', (parentRgt - lft),
              'WHEN ' + rgtCol + ' BETWEEN', parentRgt, 'AND', lft - 1, // if it's a record between the old and the new location
              'THEN', (rgt - lft + 1),
              'ELSE 0 END'
            ].join(' ')),

            'lft': raw([
              lftCol + ' + CASE WHEN',
              lftCol + ' BETWEEN', lft, 'AND', rgt, // if it's the current record or one of it's children
              'THEN', (parentRgt - lft),
              'WHEN ' + lftCol + ' BETWEEN', parentRgt, 'AND', lft - 1, // if it's a record between the old and the new location
              'THEN', (rgt - lft + 1),
              'ELSE 0 END'
            ].join(' ')),

            'depth': raw([
              'CASE WHEN',
              lftCol + ' >', lft, 'AND ' + rgtCol + ' <', rgt, // if it's any of it's children
              'THEN ' + depthCol + ' - ', depthDiff,
              'ELSE ' + depthCol + ' END' // dont change the depth
            ].join(' '))
          })
          .then(function(a){
            done()
          })
        }else{
          // move the records to the "right"
          self.query().transacting(transaction)
          .whereBetween('lft', [lft, parentRgt]).orWhereBetween('rgt', [lft, parentRgt])
          .update({
            'rgt': raw([
              rgtCol + ' + CASE WHEN',
              rgtCol + ' BETWEEN', lft, 'AND', rgt, // if it's the current record or one of it's children
              'THEN', (parentRgt - rgt - 1),
              'WHEN ' + rgtCol + ' BETWEEN', rgt + 1, 'AND', parentRgt - 1, // if it's a record between the old and the new location
              'THEN', (lft - rgt - 1),
              'ELSE 0 END'
            ].join(' ')),

            'lft': raw([
              lftCol + ' + CASE WHEN',
              lftCol + ' BETWEEN', lft, 'AND', rgt, // if it's the current record or one of it's children
              'THEN', (parentRgt - rgt - 1),
              'WHEN ' + lftCol + ' BETWEEN', rgt + 1, 'AND', parentRgt - 1, // if it's a record between the old and the new location
              'THEN', (lft - rgt - 1),
              'ELSE 0 END'
            ].join(' ')),

            'depth': raw([
              'CASE WHEN',
              lftCol + ' >', lft, 'AND ' + rgtCol + ' <', rgt, // if it's any of it's children
              'THEN ' + depthCol + ' - ', depthDiff,
              'ELSE ' + depthCol + ' END' // dont change the depth
            ].join(' '))
          })
          .then(function(){
            done()
          })
        }
      }else{
        done()
      }
    })


    // handles the deletion of nodes!
    this.afterDestroy(function(record, transaction, done){
      var Model = this.model
      var raw = self.store.connection.raw

      var width = record.rgt - record.lft + 1

      var rgtCol = record.definition.store.connection.client.wrapIdentifier('rgt')
      var lftCol = record.definition.store.connection.client.wrapIdentifier('lft')

      Model.transaction(transaction).where({lft_between: [record.lft, record.rgt]}).delete().then(function(){
        return self.query().transacting(transaction).where('rgt', '>', record.rgt).update({rgt: raw(rgtCol + ' - ' + width)})
      }).then(function(){
        return self.query().transacting(transaction).where('lft', '>', record.rgt).update({lft: raw(lftCol + ' - ' + width)})
      }).then(function(){
        done()
      })
    })



    // Record methods

    this.instanceMethods.moveToChildOf = function(id){
      if(typeof id === 'object') id = id.id
      this.parent_id = id
    }
  }

}


/***/ }),
/* 87 */
/***/ (function(module, exports) {

exports.migration = {
  paranoid: function(){
    this.datetime('deleted_at')
    this.integer('deleter_id')
  }
}

exports.definition = {
  paranoid: function(){
    var self = this

    this.scope('with_deleted', function(){
      this.setInternal('with_deleted', true)
    })

    this.beforeFind(function(){
      var withDeleted = this.getInternal('with_deleted') || false

      if(!withDeleted && self.attributes.deleted_at){
        this.where({deleted_at: null})
      }
      return true
    })

    this.destroy = function(options, callback){
      this.deleted_at = new Date()
      return this.save(options, callback)
    }
  }
}


/***/ }),
/* 88 */
/***/ (function(module, exports) {

exports.definition = {
  serialize: function(attribute, serializer){
    var self = this
    serializer = serializer || JSON

    this.convertOutput(attribute, function(value){
      if(value === null) return null
      if(typeof value === 'object') return value
      try{
        return serializer.parse(value)
      }catch(e){
        self.store.handleException(new Error('Serialize error for attribute "' + attribute + '"'))
        self.store.handleException(e)
        return null
      }
    }, false)


    this.convertInput(attribute, function(value){
      if(value === null) return null
      if(typeof value === 'string') return value
      try{
        return serializer.stringify(value)
      }catch(e){
        self.store.handleException(new Error('Serialize error for attribute "' + attribute + '"'))
        self.store.handleException(e)
        return null
      }
    }, false)
  }
}


/***/ }),
/* 89 */
/***/ (function(module, exports) {

var position = 'position'

exports.migration = {
  sortedList: function(){
    this.integer(position)
  }
}


exports.definition = {

  sortedList: function(options){
    var self = this
    options = options || {}

    if(options.scope && !Array.isArray(options.scope)) options.scope = [options.scope]

    // before find - add position sorting
    this.beforeFind(function(){
      if(options.scope){
        for(var i = 0; i < options.scope.length; i++){
          this.order(options.scope[i])
        }
      }

      this.order(position)
    })




    // before save: calculate new position for new records
    this.beforeSave(function(record, t, next){
      var primaryKeys = self.primary_keys
      var condition = {}
      var i

      for(i = 0; i < primaryKeys.length; i++){
        if(this[primaryKeys[i]]){
          condition[primaryKeys[i] + '_not'] = this[primaryKeys[i]]
        }
      }

      if(options.scope){
        for(i = 0; i < options.scope.length; i++){
          condition[options.scope[i]] = this[options.scope[i]]
        }
      }


      if(record[position] !== null){
        // check position

        if(record[position] < 0) record[position] = 0

        self.model.max(position).where(condition).exec(function(result){
          if(record[position] > record + 1){
            record[position] = result + 1
          }
          next()
        })
      }else{
        // non existing position
        if(options.insert === 'beginning'){
          record[position] = 0
          return next()
        }else{
          self.model.max(position).where(condition).exec(function(result){
            if(isNaN(result)) result = -1 // no entry in table
            record[position] = result + 1
            next()
          })
        }
      }
    })



    this.afterSave(function(record, t, next){
      if(record.hasChanged(position)){
        var before = record.changes[position][0]
        var tmp = self.query().transacting(t)


        if(options.scope){
          for(var i = 0; i < options.scope.length; i++){
            tmp.where(options.scope[i], '=', record[options.scope[i]])
          }
        }


        if(before === undefined) before = null

        if(before === null || before > record[position]){
          tmp.where(position, '>=', record[position])
          tmp.where('id', '!=', record.id)

          if(before !== null){
            tmp.where(position, '<', before)
          }

          return tmp.increment(position, 1).then(function(){
            next()
          })
        }else{
          tmp.where(position, '<=', record[position])
          tmp.where('id', '!=', record.id)
          tmp.where(position, '>', before)

          return tmp.increment(position, -1).then(function(){
            next()
          })
        }
      }
      next()
    })


    this.afterSave(function(record, t, next){
      if(options.scope){
        var scopeChanged = false
        var tmp = self.query()

        if(record.hasChanged()){
          tmp.where(position, '>', record.changes[position][0])
        }else{
          tmp.where(position, '>', record[position])
        }

        for(var i = 0; i < options.scope.length; i++){
          if(record.hasChanged(options.scope[i])){
            scopeChanged = true
            tmp.where(options.scope[i], '=', record.changes[options.scope[i]][0])
          }else{
            tmp.where(options.scope[i], '=', record[options.scope[i]])
          }
        }


        if(scopeChanged){
          return tmp.transacting(t).increment(position, -1).then(function(){
            next()
          })
        }
      }

      next()
    })




    this.afterDestroy(function(record, t, next){
      var tmp = self.query().transacting(t)
      tmp.where(position, '>', record[position])

      if(options.scope){
        for(var i = 0; i < options.scope.length; i++){
          tmp.where(options.scope[i], '=', record[options.scope[i]])
        }
      }

      tmp.increment(position, -1).then(function(){
        next()
      })
    })
  }
}


/***/ }),
/* 90 */
/***/ (function(module, exports) {

exports.migration = {
  stampable: function(){
    this.timestamp()
    this.userstamp()
  },

  timestamp: function(){
    this.datetime('created_at')
    this.datetime('updated_at')
  },

  userstamp: function(){
    this.integer('creator_id')
    this.integer('updater_id')
  }
}


exports.definition = {
  stampable: function(){
    var self = this
    this.beforeSave(function(){
      var now = new Date()

      var userId = null

      if(typeof self.store.getUserByFn === 'function'){
        userId = self.store.getUserByFn(this, self)
      }else{
        if(this.context && this.context.user){
          userId = this.context.user.id
        }
      }

      if(!this.__exists){
        if(self.attributes.created_at){
          this.created_at = this.created_at || now
        }

        if(self.attributes.creator_id){
          this.creator_id = this.creator_id || userId
        }
      }

      if(this.hasChanges()){ // only set updated_at or updater_id if there are any changes
        if(self.attributes.updated_at && !this.hasChanged('updated_at')){
          this.updated_at = now
        }

        if(self.attributes.updater_id && !this.hasChanged('updater_id')){
          this.updater_id = userId || this.updater_id
        }
      }

      return true
    })
  }
}

exports.store = {
  getUserBy: function(callback){
    this.getUserByFn = callback
  }
}


/***/ }),
/* 91 */
/***/ (function(module, exports) {

exports.definition = {
  mixinCallback: function(){
    var self = this

    this.scope('totalCount', function(){
      var key = self.primary_keys[0]
      this.count(self.getName() + '.' + key, true)
      this.limit(null, null)
      this.order(null)
    })
  }
}


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = [
  __webpack_require__(93),
  __webpack_require__(94),
  __webpack_require__(95),
  __webpack_require__(96),
  __webpack_require__(97),
  __webpack_require__(98),
  __webpack_require__(99),
  __webpack_require__(100),
  __webpack_require__(101)
]


/***/ }),
/* 93 */
/***/ (function(module, exports) {

exports.store = {

  mixinCallback: function(){
    const Utils = this.utils

    // EQUAL OPERATOR (=, is null)
    this.addOperator('eq', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '=', value)
    }, {
      default: true,
      nullify_empty_array: true,
      on: {
        'array': function(attr, value, query, cond){
          query.whereIn(Utils.getAttributeName(this, cond), value)
        },

        'null': function(attr, value, query, cond){
          query.whereNull(Utils.getAttributeName(this, cond))
        },

        'attribute': function(attr, value, query, cond){ // TODO: same for other operators?!
          query.whereRaw(Utils.getAttributeName(this, cond, true) + ' = ' + Utils.getAttributeName(this, value, true))
        }
      }
    })



    // NOT OPERATOR (!=, is not null)
    this.addOperator('not', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '!=', value)
    }, {
      nullify_empty_array: true,
      on: {
        'array': function(attr, value, query, cond){
          query.whereNotIn(Utils.getAttributeName(this, cond), value)
        },

        'null': function(attr, value, query, cond){
          query.whereNotNull(Utils.getAttributeName(this, cond))
        }
      }
    })



    // GREATER THAN OPERATOR (>)
    this.addOperator('gt', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '>', value)
    }, {
      on: {
        'array': false // TODO: multiple orWhere() ??
      }
    })

    // GREATER THAN EQUAL OPERATOR (>=)
    this.addOperator('gte', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '>=', value)
    }, {
      on: {
        'array': false // TODO: multiple orWhere() ??
      }
    })

    // LOWER THAN OPERATOR (<)
    this.addOperator('lt', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '<', value)
    }, {
      on: {
        'array': false // TODO: multiple orWhere() ??
      }
    })

    // LOWER THAN EQUAL OPERATOR (<=)
    this.addOperator('lte', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '<=', value)
    }, {
      on: {
        'array': false // TODO: multiple orWhere() ??
      }
    })




    // BETWEEN OPERATOR (between)
    this.addOperator('between', function(attr, values, query, cond){
      if(Array.isArray(values[0])){
        var self = this
        query.where(function(){
          for(var i = 0; i < values.length; i++){
            this.orWhereBetween(Utils.getAttributeName(self, cond), values[i])
          }
        })
      }else{
        query.whereBetween(Utils.getAttributeName(this, cond), values)
      }
    }, {
      on: {
        'all': false,
        'array': true
      }
    })


    // LIKE OPERATOR (like)
    this.addOperator('like', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), 'like', '%' + value + '%')
    }, {
      on: {
        'all': false,
        'string': true,
        'array': function(attr, values, query, cond){
          var self = this
          query.where(function(){
            for(var i = 0; i < values.length; i++){
              this.orWhere(Utils.getAttributeName(self, cond), 'like', '%' + values[i] + '%')
            }
          })
        }
      }
    })



    // iLIKE OPERATOR (ilike)
    this.addOperator('ilike', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), 'ilike', '%' + value + '%')
    }, {
      on: {
        'all': false,
        'string': true,
        'array': function(attr, values, query, cond){
          var self = this
          query.where(function(){
            for(var i = 0; i < values.length; i++){
              this.orWhere(Utils.getAttributeName(self, cond), 'ilike', '%' + values[i] + '%')
            }
          })
        }
      }
    })
  }

}


/***/ }),
/* 94 */
/***/ (function(module, exports) {

exports.store = {

  mixinCallback: function(){
    this.addType('binary', {
      read: function(value){
        if(value === null) return null

        if(Buffer.from) return Buffer.from(value, 'binary')
        return new Buffer(value, 'binary') // eslint-disable-line node/no-deprecated-api
      },
      write: function(buffer){
        if(buffer === null) return null
        return buffer.toString('binary')
      }
    }, {
      migration: 'binary',
      extend: Buffer,
      operators: {
        defaults: ['eq', 'not']
      }
    })
  }
}


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

const validator = __webpack_require__(2)

exports.store = {

  mixinCallback: function(){
    this.addType('boolean', function(value){
      if(value === null) return null
      return validator.toBoolean(value + '')
    }, {
      migration: 'boolean',
      operators: {
        defaults: ['eq', 'not']
      }
    })
  }
}


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(4)
const format = __webpack_require__(8)

exports.store = {

  mixinCallback: function(){
    this.addType('date', {
      read: function(value){
        if(value === null) return null
        return format(parse(value), 'YYYY-MM-DD')
      },
      input: function(value){
        if(value === null) return null
        return format(parse(value), 'YYYY-MM-DD')
      },
      write: function(value){
        return value
      },
      output: function(value){
        return value
      }
    }, {
      migration: 'date',
      operators: {
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    })
  }
}


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(4)

exports.store = {

  mixinCallback: function(){
    this.addType('datetime', function(value){
      if(value === null) return null
      return parse(value)
    }, {
      migration: 'datetime',
      operators: {
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    })
  }
}


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

const validator = __webpack_require__(2)

exports.store = {

  mixinCallback: function(){
    this.addType('float', function(value){
      if(value === null) return null
      if(value === '') return null
      return validator.toFloat(value + '')
    }, {
      migration: 'float',
      operators: {
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    })
  }
}


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

const validator = __webpack_require__(2)

exports.store = {

  mixinCallback: function(){
    this.addType('integer', function(value){
      if(value === null) return null
      if(value === '') return null
      return validator.toInt(value + '')
    }, {
      migration: 'integer',
      operators: {
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    })
  }
}


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

const validator = __webpack_require__(2)

exports.store = {

  mixinCallback: function(){
    this.addType('string', function(value){
      if(value === null) return null
      return validator.toString(value + '')
    }, {
      migration: ['string', 'text'],
      operators: {
        defaults: ['eq', 'not', 'like', 'ilike']
      }
    })
  }
}


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(4)
const format = __webpack_require__(8)

exports.store = {

  mixinCallback: function(){
    this.addType('time', {
      read: function(value){
        return value
      },
      input: function(value){
        if(value === null) return null
        var dt

        if(typeof value === 'string'){
          dt = parse('2000-01-01 ' + value)
        }else{
          dt = parse(value)
        }

        return format(dt, 'HH:mm:ss')
      },
      write: function(value){
        return value
      },
      output: function(value){
        return value
      }
    }, {
      migration: 'time',
      operators: {
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    })
  }
}


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = [
  __webpack_require__(103),
  __webpack_require__(104),
  __webpack_require__(106)
]


/***/ }),
/* 103 */
/***/ (function(module, exports) {

/*
 * STORE
 */
exports.store = {
  loadTableAttributes: function(name){
    return this.connection.raw(
      "PRAGMA table_info('" + name + "')"
    )
    .then(function(result){
      var attributes = []
      for(var i in result){
        var _default = result[i].dflt_value
        if(_default) _default = _default.replace(/(^'|'$)/g, '')

        var attrDef = {
          name: result[i].name,
          type: simplifiedType(result[i].type),
          options: {
            description: null, // TODO
            persistent: true,
            primary: result[i].pk !== 0,
            notnull: result[i].notnull === 1,
            default: _default,
            writable: !(result[i].pk !== 0 && result[i].type.toLowerCase() === 'integer') // set to false if primary and integer
          },
          validations: []
        }

        if(result[i].notnull === 1 && result[i].pk === 0){
          attrDef.validations.push({name: 'validatesPresenceOf', args: []})
        }
        attributes.push(attrDef)
      }

      return attributes
    })
  }
}


function simplifiedType(type){
  type = type.replace(/\(.+\)/, '').toUpperCase()
  switch(type){
    case 'INT':
    case 'INTEGER':
    case 'TINYINT':
    case 'SMALLINT':
    case 'MEDIUMINT':
    case 'BIGINT':
    case 'UNSIGNED BIG INT':
    case 'INT2':
    case 'INT8':
      return 'integer'

    case 'REAL':
    case 'DOUBLE':
    case 'DOUBLE PRECISION':
    case 'FLOAT':
    case 'NUMERIC':
    case 'DECIMAL':
      return 'float'

    case 'BOOLEAN':
      return 'boolean'

    case 'DATE':
      return 'date'

    case 'DATETIME':
      return 'datetime'

    default:
      return 'string'
  }
};


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

const Knex = __webpack_require__(105)

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.connection = Knex({
      dialect: 'sqlite3',
      connection: {
        filename: this.config.file
      },
      useNullAsDefault: true
    })
  }
}


/***/ }),
/* 105 */
/***/ (function(module, exports) {

module.exports = require("knex");

/***/ }),
/* 106 */
/***/ (function(module, exports) {

exports.migration = {
  addColumn: function(table, columnFn){
    var self = this
    var fields = this.fields = []

    if(typeof columnFn === 'function'){
      columnFn.call(self)
    }


    this.queue.push(function(next){
      // Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.schema.table(table, function(table){
        for(var i = 0; i < fields.length; i++){
          if(typeof fields[i] === 'function'){
            fields[i].call(self, table)
          }
        }
      }).then(function(){
        next()
      }, function(err){
        next(err)
      })
    })

    return this
  },


  renameColumn: function(table, from, to){
    if(process.env.NODE_ENV !== 'test') console.log('NO SUPPORT FOR SQLITE3 AT THE MOMENT')
    return this
  },


  removeColumn: function(table, name){
    if(process.env.NODE_ENV !== 'test') console.log('NO SUPPORT FOR SQLITE3 AT THE MOMENT')
    return this
  }
}


/***/ })
/******/ ]);
});