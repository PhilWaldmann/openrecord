var events = require('events');
var util   = require('util');
var async  = require('async');

var Utils = require('./utils');

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







var Definition = function(store, model_name){

  this.store = store;
  this.model_name = model_name;
  this.model = null;

  this.middleware = [];

  this.instanceMethods = {};
  this.staticMethods = {};

  events.EventEmitter.call(this);

};

util.inherits(Definition, events.EventEmitter);



Definition.prototype.getName = function(){
  return this.model_name;
}


Definition.prototype.getInstanceMethods = function(){
  return Object.create(this.instanceMethods);
};

Definition.prototype.getStaticMethods = function(){
  return Object.create(this.staticMethods);
};





Definition.prototype.include = function(mixins){
  //Mixins for this class
  Utils.mixin(this, mixins, {only: 'definition', cwd: __dirname});

  //Mixins for the Model
  Utils.mixin(this.staticMethods, mixins, {only: 'model', cwd: __dirname});
  //Mixins for the Model.prototype
  Utils.mixin(this.instanceMethods, mixins, {only: 'record', cwd: __dirname});
};



Definition.prototype.use = function(fn, priority){
  var self = this;

  if(self.model && self.model.finished){
    return fn.call(self); //enhancing a model is currently only possible in a synchronous fashion
  }

  priority = priority || 0;

  var middleware_fn = function(next){
    var called = false;
    var done = function(){
      if(called) return;
      called = true;
      next(null);
    };

    fn.call(self, done);

    //call `done` if fn does not have any params
    if(fn.length == 0){
      done();
    }
  };

  middleware_fn.priority = priority;

  this.middleware.push(middleware_fn);
};


Definition.prototype.define = function(callback){
  var self = this;
  var tmp = [];

  //put model definition middleware at the end and plugin middleware at the beginning (workaround)
  //var middleware = this.middleware;
  //this.middleware = [];

  Utils.mixinCallbacks(this);

  //this.middleware = this.middleware.concat(middleware);

  this.middleware.sort(function(a, b){
    return a.priority < b.priority;
  });

  this.middleware.push(this.createModel.bind(this));


  async.series(this.middleware, function(){
    delete self.model['building'];
    self.model['finished'] = true;

    self.emit('finished');
    callback(self.model);
  });
};





/*
 * MODEL CREATION MIDDLEWARE
 */

Definition.prototype.createModel = function(next){

  var self = this;

  var Model = function(){
    this.setInternalValues();
    //events.EventEmitter.call(this);
    Utils.mixinCallbacks(this, arguments, true);
  };

  Model['building'] = true;

  Model.prototype = this.getInstanceMethods();
  Model.prototype.setInternalValues = function(){
    Object.defineProperty(this, 'definition', {enumerable: false, writable: true, value: self});
    Object.defineProperty(this, 'model', {enumerable: false, writable: false, value: Model});
  }

  var static_methods = this.getStaticMethods();
  for( var key in static_methods ) {
    Model[key] = static_methods[key];
  }

  //Mixin the Eventemitter class
  //Utils.mixin(Model.prototype, events.EventEmitter.prototype);

  Object.defineProperty(Model, 'definition', {enumerable: false, writable: false, value: self});


  this.model = Model;

  next(null);
};


module.exports = Definition;
