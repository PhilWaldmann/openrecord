var events = require('events');
var util   = require('util');
var async  = require('async');

var Utils = require('./utils');

var Definition = function(store, model_name){
  
  this.store = store;
  this.model_name = model_name;
  this.model = null;
  
  this.middleware = [];
  
  this.instanceMethods = {};
  this.staticMethods = {};
  this.configuration = {};
  
  events.EventEmitter.call(this);
      
};

util.inherits(Definition, events.EventEmitter);





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



Definition.prototype.use = function(fn){
  var self = this;
  
  this.middleware.push(function(next){
    var done = function(){
      next(null);
    };
    
    fn.call(self, done);

    //call `done` if fn does not have any params
    if(fn.length == 0){
      done();
    }
  });
};


Definition.prototype.define = function(callback){
  var self = this;
  var tmp = [];
  
  //put model definition middleware at the end and plugin middleware at the beginning (workaround)
  var middleware = this.middleware;
  this.middleware = [];
  
  Utils.mixinCallbacks(this);
  
  this.middleware = this.middleware.concat(middleware);
  
    
  this.middleware.push(this.createModel.bind(this));
  
  async.parallel(this.middleware, function(){
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
    Utils.mixinCallbacks(this, arguments, true);
  };
  
  Model.prototype = this.getInstanceMethods();
  
  Model.prototype.setInternalValues = function(){
    Object.defineProperty(this, 'definition', {enumerable: false, writable: false, value: self});  
    Object.defineProperty(this, 'model', {enumerable: false, writable: false, value: Model});
  }
  
  var static_methods = this.getStaticMethods();
  for( var key in static_methods ) {
    Model[key] = static_methods[key];         
  }
  
  //Utils.mixinCallbacks(Model) ????
  
  Object.defineProperty(Model, 'definition', {enumerable: false, writable: false, value: self});

  this.model = Model;

  next(null);
};


module.exports = Definition;