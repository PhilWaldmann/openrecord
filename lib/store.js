var events = require('events');
var util   = require('util');
var path   = require('path');
var async  = require('async');

var Utils = require('./utils');
var Definition = require('./definition');

var pseudo_logger = {
  trace: process.env.TRACE ? console.trace : function(){},
  info: process.env.DEBUG ? console.info : function(){},
  warn: console.warn,
  error: console.error
};

var GLOBAL_STORES = {};
var STORE_COUNTER = 0;
var STORE_WAIT = {};



var Store = function(config){
  STORE_COUNTER++;

  config = config || {};

  this.definitions = {};
  this.models      = {};
  this.config      = config;
  this.global      = config.global || false;
  this.type        = config.type || 'base';
  this.logger      = config.logger || pseudo_logger;
  this.name        = config.name || 'store' + STORE_COUNTER;
  this.throw       = config.throw_errors !== undefined ? config.throw_errors : process.env.NODE_ENV === 'test';

  this.models_waiting = 0;
  this.middleware = [];

  this.async  = async;

  Store.registerStore(this);


  events.EventEmitter.call(this);
  this.setMaxListeners(0);

  if(!Store.registeredTypes[this.type]){
    throw new Store.UnknownStoreTypeError(config.type);
  }

  this.mixinPaths = Utils.clone(Store.registeredTypes[this.type]);

  if(config.plugins) this.mixinPaths = this.mixinPaths.concat(config.plugins);

  Utils.mixin(Utils, this.mixinPaths, {only: 'utils'});
  Utils.mixin(this, this.mixinPaths, {only: 'store'});
  Utils.mixinCallbacks(this, config);

  if(config.models){
    this.loadModels(config.models);
  }

};

util.inherits(Store, events.EventEmitter);



Store.registeredTypes = {
  'base':            [__dirname + '/base/*.js'],
  'sql':             [__dirname + '/base/*.js', __dirname + '/persistence/*.js', __dirname + '/stores/sql/**/*.js'],
  'postgres':        [__dirname + '/base/*.js', __dirname + '/persistence/*.js', __dirname + '/stores/sql/**/*.js', __dirname + '/stores/postgres/**/*.js'],
  'sqlite3':         [__dirname + '/base/*.js', __dirname + '/persistence/*.js', __dirname + '/stores/sql/**/*.js', __dirname + '/stores/sqlite3/**/*.js'],
  'mysql':           [__dirname + '/base/*.js', __dirname + '/persistence/*.js', __dirname + '/stores/sql/**/*.js', __dirname + '/stores/mysql/**/*.js'],
  'rest':            [__dirname + '/base/*.js', __dirname + '/persistence/*.js', __dirname + '/stores/rest/**/*.js'],
  'ldap':            [__dirname + '/base/*.js', __dirname + '/persistence/*.js', __dirname + '/stores/ldap/**/*.js'],
  'activedirectory': [__dirname + '/base/*.js', __dirname + '/persistence/*.js', __dirname + '/stores/ldap/**/*.js', __dirname + '/stores/activedirectory/**/*.js']
};





Store.prototype.Model = function(name, fn){
  if(!fn){
    return this.models[name.toLowerCase()];
  }

  if(this.models[name.toLowerCase()]){
    //extend the existing model
    this.models[name.toLowerCase()].definition.use(fn);
  }else{

    if(this.definitions[name.toLowerCase()]){
      this.definitions[name.toLowerCase()].use(fn);
      return;
    }

    //create a new model
    this.models_waiting++;

    var self = this;
    var definition = new Definition(this, name);

    definition.include(this.mixinPaths);
    definition.use(fn);

    this.definitions[name.toLowerCase()] = definition;
    process.nextTick(function(){
      definition.define(function(Model){
        self.models[name.toLowerCase()] = Model;

        if(self.global){
          if(self.config.global_prefix){
            global[self.config.global_prefix + name] = Model;
          }else{
            global[name] = Model;
          }
        }


        //emit `model_created` and `<model-name>_created` events
        self.emit('model_created', Model);
        self.emit(name + '_created', Model);

        self.ready();
      });
    });


  }

};



Store.prototype.loadModels = function(loadpath){
  var models = Utils.require(loadpath, {includePathNames: true});

  for(var fullpath in models){
    if(models.hasOwnProperty(fullpath) && typeof models[fullpath] == 'function'){
      var model_name = models[fullpath].name || Utils.getModelName( path.basename(fullpath, path.extname(fullpath)) );

      this.Model(model_name, models[fullpath]);
    }
  }
};



Store.prototype.use = function(fn){
  var self = this;

  var middleware_fn = function(next){
    var done = function(){
      next(null);
    };

    fn.call(self, self, done);

    //call `done` if fn does not have any params
    if(fn.length < 2){
      done();
    }
  };

  this.middleware.push(middleware_fn);
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
    var self = this;
    async.series(this.middleware, function(){
      self.emit('ready');
    });
  }
};




Store.getStoreByName = function(name){
  return GLOBAL_STORES[name];
};

Store.waitForStore = function(name, callback){
  STORE_WAIT[name] = STORE_WAIT[name] || [];
  STORE_WAIT[name].push(callback);
};


Store.registerStore = function(store){
  var name = store.name;

  GLOBAL_STORES[name] = store;

  if(STORE_WAIT[name]){
    for(var i = 0; i < STORE_WAIT[name].length; i++){
      STORE_WAIT[name][i](store);
    }
    STORE_WAIT[name] = null;
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
