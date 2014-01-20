var events = require('events');
var util   = require('util');

var Utils = require('./utils');
var Definition = require('./definition');

var Store = function(config){
  
  config = config || {};
  
  this.models = {};  
  this.config = config;
  this.global = config.global || false;
  this.type   = config.type || 'base';
      
  if(!Store.registeredTypes[this.type]){
    throw new Error('Unknown connection type ' + config.type);
  }
  
  events.EventEmitter.call(this);
    
    
  Utils.mixin(this, Store.registeredTypes[this.type], {only: 'store'});
  Utils.mixinCallbacks(this, config);
  
};

util.inherits(Store, events.EventEmitter);


Store.registeredTypes = {
  'base':     [__dirname + '/base/*.js'],
  'sql':      [__dirname + '/base/*.js', __dirname + '/stores/sql/*.js'],
  'postgres': [__dirname + '/base/*.js', __dirname + '/stores/sql/*.js', __dirname + '/stores/postgres/*.js'],
  'sqlite3':  [__dirname + '/base/*.js', __dirname + '/stores/sql/*.js', __dirname + '/stores/sqlite3/*.js']
};



Store.prototype.Model = function(name, fn){
  if(!fn){
    return this.models[name]; 
  }
    
  this._ready = false;
    
  var self = this;
  var definition = new Definition(this, name);
  

  definition.include(Store.registeredTypes[this.type]);
    
  definition.use(fn);
  
  definition.define(function(Model){
    self.models[name] = Model;
    
    if(self.global){
      global[name] = Model;
    }
    
    //emit `model_created` and `<model-name>_created` events
    self.emit('model_created', Model);
    self.emit(name + '_created', Model);
    
    self.ready();
  });  
    
};


Store.prototype.ready = function(fn){
  if(fn){
    if(this._ready){
      fn();
    }else{
      this.once('ready', fn);
    }
    return;
  }  
  
  this._ready = true;
  for(var i in this.models){
    if(!this.models[i].definition){
      this._ready = false;
    }
  }
  
  if(this._ready) this.emit('ready');
};


module.exports = Store;