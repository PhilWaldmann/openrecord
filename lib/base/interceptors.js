var async = require('async');

var Utils = require('../utils');
var Store = require('../store');

Store.addExceptionType(function UnknownInterceptorError(name){
  Error.apply(this);
  this.message = 'Can not find interceptor "' + name + '"';
});

Store.addExceptionType(function NoCallbackError(){
  Error.apply(this);
  this.message = 'No callback given';
});



/**
 * There are different phases for every process. Below are different hooks you could use to build your business logic
 * Every hook needs to return `true` or `false`. If you return `false` the whole process will be stopped.
 * You could use every hook synchronous or asynchronous.
 * 
 * Synchronous: just return `true` or `false`
 * Asynchronous: put a `done` parameter into your callback and call `done()` when finished.
 *
 * @section Definition/Hooks
 * @name Hooks / Interceptors
 */ 


/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.interceptors = [];
    
    /**
     * Will be called before a validation. This hook will be called by `Record.save()`
     * @section Definition/Hooks
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
    this.addInterceptor('beforeValidation');
    
    
    /**
     * Will be called after a validation. This hook will be called by `Record.save()`
     * @section Definition/Hooks
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
    this.addInterceptor('afterValidation');    
  },
  
  addInterceptor: function(name){
    this.interceptors.push(name);
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    var tmp = {};
    
    for(var i in this.store.interceptors){
      var name = this.store.interceptors[i];
      tmp[name] = [];
      (function(name){
        self[name] = function(callback, priority){
          self.addInterceptor(name, callback, priority);
        }
      })(name);      
    }
    
    //Interceptor callback lists
    this.interceptors = tmp;
  },
  
  
  addInterceptor: function(name, callback, priority){
    priority = priority || 0;
    
    if(this.interceptors[name]){
      
      var fn = function(args, next){
        if(callback.length <= args.length){
          //via return;
          try{
            var result = callback.apply(this, args);
          }catch(e){
            return next(e);
          }
          
          if(result === false) result = 'false'; //see async.applyEach below
          if(!(result instanceof Error) && result !== 'false') result = null;          
          next(result);
        }else{
          //via next();
          callback.apply(this, args.concat(function(result){
            if(result === false) result = 'false'; //see async.applyEach below
            if(!(result instanceof Error) && result !== 'false') result = null;
            next(result);
          }));
        }
      };
      
      fn.priority = priority;

      this.interceptors[name].push(fn);
    }else{
      throw new Error('Can not find interceptor ' + name);
    }
  }
};



/*
 * MODEL
 */
exports.model = {
  callInterceptors: function(name, scope, args, resolve, reject){ //TODO: do we need the scope here?
    
    if(typeof args == 'function'){
      reject = resolve
      resolve = args;
      args = [];
    }
    
    var store = this.definition.store;
    
    if(!this.definition.interceptors[name]) return this.definition.store.handleException(new UnknownInterceptorError(name));
    if(typeof resolve != 'function') return this.definition.store.handleException(new NoCallbackError());
    if(typeof reject != 'function') reject = store.handleException.bind(store);
    
    var fns = [];
    
    this.definition.interceptors[name].sort(function(a, b){
      return a.priority < b.priority;
    });
    
    for(var i in this.definition.interceptors[name]){
      (function(interceptor){
        fns.push(function(next){
          interceptor.call(scope, args, next);
        });
      })(this.definition.interceptors[name][i]);
    }
    
    if(fns.length == 0){
      return resolve(true);
    }
    
    async.series(fns, function(err, result){
      if(err instanceof Error){
        reject(err);
      }else{
        //we need to provide a sting instead of a boolean value to make async.applyEach() work the way we want it.
        resolve(err === 'false' ? false : true);
      }      
    });    
  }
};


/*
 * RECORD
 */
exports.record = {
  callInterceptors: function(name, args, resolve, reject){
    this.model.callInterceptors(name, this, args, resolve, reject);
  }
}

