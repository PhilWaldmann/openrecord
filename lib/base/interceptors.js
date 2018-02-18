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
    const Store = require('../store')

    this.interceptors = []

    Store.addExceptionType(function UnknownInterceptorError(name){
      Error.apply(this)
      this.message = 'Can not find interceptor "' + name + '"'
    })

    Store.addExceptionType(function NoCallbackError(){
      Error.apply(this)
      this.message = 'No callback given'
    })

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


  addInterceptor: function(name, fn, priority){
    priority = priority || 0

    if(this.interceptors[name]){
      fn.priority = priority
      this.interceptors[name].push(fn)
    }else{
      throw new this.store.UnknownInterceptorError(name)
    }
  },



  callInterceptors: function(name, scope, args){
    if(!this.interceptors[name]) return Promise.reject(new this.store.UnknownInterceptorError(name))

    var tasks = []

    this.interceptors[name]
    .sort(function(a, b){
      return a.priority < b.priority
    })
    .forEach(function(interceptor){
      tasks.push(function(){
        return interceptor.apply(scope, args)
      })
    })

    return this.store.utils.series(tasks)
  }
}



/*
 * MODEL
 */
exports.model = {
  callInterceptors: function(name, args){
    return this.definition.callInterceptors(name, this, args)
  }
}


/*
 * RECORD
 */
exports.record = {
  callInterceptors: function(name, args, resolve, reject){
    return this.definition.callInterceptors(name, this, args)
  }
}
