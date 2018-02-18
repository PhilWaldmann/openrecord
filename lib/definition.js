const events = require('events')
const util = require('util')


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

  priority = priority || 0

  var middlewareFn = function(){
    return fn.call(self)
  }

  middlewareFn.priority = priority

  this.middleware.push(middlewareFn)
}


Definition.prototype.define = function(){
  var self = this

  this.store.utils.mixinCallbacks(this)

  // sort middleware by priority
  this.middleware.sort(function(a, b){
    return a.priority < b.priority
  })

  // and add the createModel middleware at the end
  this.middleware.push(this.createModel.bind(this))

  return this.store.utils.series(this.middleware)
  .then(function(){
    delete self.model['building']
    self.model['finished'] = true
    self.middleware = [] // reset middleware in case of  a late Model enhancement

    self.emit('finished')
    return {Model: self.model}
  })
}





/*
 * MODEL CREATION MIDDLEWARE
 */

Definition.prototype.createModel = function(){
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
    Object.defineProperty(this, 'store', {enumerable: false, writable: false, value: self.store})
  }

  var staticMethods = this.getStaticMethods()
  for(var key in staticMethods) {
    Model[key] = staticMethods[key]
  }

  Object.defineProperty(Model, 'definition', {enumerable: false, writable: false, value: self})
  Object.defineProperty(Model, 'store', {enumerable: false, writable: false, value: self.store})


  this.model = Model
}


module.exports = Definition
