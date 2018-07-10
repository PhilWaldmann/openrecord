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
  mixinCallback: function() {
    const Store = require('../store')

    this.interceptors = []

    Store.addExceptionType(function UnknownInterceptorError(name) {
      Error.apply(this)
      this.message = 'Can not find interceptor "' + name + '"'
    })

    Store.addExceptionType(function NoCallbackError() {
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
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('afterValidation')

    /**
     * Will be called before every SQL find. This hook will be called by `Model.exec()`
     * @class Definition
     * @method beforeFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {object} query - The internal knex instance
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
    this.addInterceptor('onRelationCondition')

    /**
     * Will be called before every create. This hook will be called by `Record.save()`
     * @class Definition
     * @method beforeCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} options
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
     * @param {object} options
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
     * @param {object} options
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
     * @param {object} options
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
     * @param {object} options
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
     * @param {object} options
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
     * @param {object} options
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
     * @param {object} options
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
  },

  addInterceptor: function(name) {
    this.interceptors.push(name)
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    var self = this
    var tmp = {}

    for (var i in this.store.interceptors) {
      var name = this.store.interceptors[i]
      tmp[name] = []
      ;(function(name) {
        self[name] = function(callback, priority) {
          this.addInterceptor(name, callback, priority)
          return self
        }
      })(name)
    }

    // Interceptor callback lists
    this.interceptors = tmp
  },

  addInterceptor: function(name, fn, priority) {
    priority = priority || 0

    if (this.interceptors[name]) {
      fn.priority = priority
      this.interceptors[name].push(fn)
    } else {
      throw new this.store.UnknownInterceptorError(name)
    }

    return this
  },

  callInterceptors: function(name, scope, args, options) {
    if (!this.interceptors[name])
      return Promise.reject(new this.store.UnknownInterceptorError(name))

    var tasks = []

    this.interceptors[name]
      .sort(function(a, b) {
        if (a.priority < b.priority) return 1
        if (a.priority > b.priority) return -1
        return 0
      })
      .forEach(function(interceptor) {
        const task = function() {
          return interceptor.apply(scope, args)
        }
        task.priority = interceptor.priority
        tasks.push(task)
      })

    if (options && options.executeInParallel)
      return this.store.utils.parallel(tasks)
    return this.store.utils.parallelWithPriority(tasks)
  }
}

/*
 * MODEL
 */
exports.model = {
  callInterceptors: function(name, args, options) {
    return this.definition.callInterceptors(name, this, args, options)
  }
}

/*
 * RECORD
 */
exports.record = {
  callInterceptors: function(name, args, options) {
    return this.definition.callInterceptors(name, this, args, options)
  }
}
