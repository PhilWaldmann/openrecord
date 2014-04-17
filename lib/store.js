var events = require('events');
var util   = require('util');
var path   = require('path');

var Utils = require('./utils');
var Definition = require('./definition');

var Store = function(config){
  
  config = config || {};
  
  this.models = {};  
  this.config = config;
  this.global = config.global || false;
  this.type   = config.type || 'base';
  
  this.models_waiting = 0;
  
  events.EventEmitter.call(this);
  this.setMaxListeners(0);
      
  if(!Store.registeredTypes[this.type]){
    throw new Store.UnknownStoreTypeError(config.type);
  }
  
  
  if(config.plugins) Store.registeredTypes[this.type] = Store.registeredTypes[this.type].concat(config.plugins);

  Utils.mixin(this, Store.registeredTypes[this.type], {only: 'store'});
  Utils.mixinCallbacks(this, config);
  
  if(config.models && typeof config.models == 'string'){
    this.loadModels(config.models);
  }
  
};

util.inherits(Store, events.EventEmitter);



Store.registeredTypes = {
  'base':     [__dirname + '/base/*.js'],
  'sql':      [__dirname + '/base/*.js', __dirname + '/stores/sql/**/*.js'],
  'postgres': [__dirname + '/base/*.js', __dirname + '/stores/sql/**/*.js', __dirname + '/stores/postgres/*.js'],
  'sqlite3':  [__dirname + '/base/*.js', __dirname + '/stores/sql/**/*.js', __dirname + '/stores/sqlite3/*.js'],
  'mysql':    [__dirname + '/base/*.js', __dirname + '/stores/sql/**/*.js', __dirname + '/stores/mysql/*.js'],
  'rest':     [__dirname + '/base/*.js', __dirname + '/stores/rest/**/*.js']
};





Store.prototype.Model = function(name, fn){
  if(!fn){
    return this.models[name]; 
  }
    
  this.models_waiting++;
    
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



Store.prototype.loadModels = function(loadpath){
  var models = Utils.require(loadpath, {includePathNames: true});
  
  for(var fullpath in models){
    if(models.hasOwnProperty(fullpath) && typeof models[fullpath] == 'function'){
      var model_name = Utils.getModelName( path.basename(fullpath, path.extname(fullpath)) );
      
      this.Model(model_name, models[fullpath]);
    }
  }
};





Store.prototype.ready = function(fn){
  if(fn){
    if(this.models_waiting === 0){
      fn();
    }else{
      this.once('ready', fn);
    }
    return;
  }  
  
  this.models_waiting--;
  
  if(this.models_waiting === 0){
    this.emit('ready');
  }
};





Store.addExceptionType = function(cls){
  if(typeof cls == 'function' && typeof cls.name == 'string'){
    if(!Store[cls.name]){
      if(!cls.captureStackTrace){
        util.inherits(cls, Error);
      }
      
      cls.prototype.name = cls.name;
      
      Store[cls.name] = cls;
    }
  }  
};

Store.addExceptionType(function UnknownStoreTypeError(type){
  Error.call(this);
  this.message = 'Unknown connection type "' + type + '"';
});



module.exports = Store;