const async = require('async')
const inflection = require('inflection')


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
