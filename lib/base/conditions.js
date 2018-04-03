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
    var primaryKeys = self.definition.primaryKeys

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
    const Utils = this.definition.store.utils
    const self = this.chain()

    const parentRelations = self.getInternal('parent_relations')
    const conditions = Utils.toConditionList(Utils.args(arguments), Object.keys(self.definition.attributes))
    
    conditions.forEach(function(cond){
      if(cond.type === 'relation' && ! self.definition.relations[cond.relation] && !self.options.polymorph){        
        throw new Error('Can\'t find attribute or relation "' + cond.relation + '" for ' + self.definition.modelName)  
      }
      // used for joins only
      if(parentRelations){
        cond.parents = parentRelations
        if(cond.value && cond.value.$attribute && !cond.value.$parents){
          cond.value.$parents = parentRelations
        }
      }
      
      self.addInternal('conditions', cond)
    })
    
    return self
  },









  _applyCondtions: function(conditions, query){
    var self = this
    var calls = []
    
    conditions.forEach(function(condition){
      if(!condition) return
      calls.push(function(){        
        var interceptor = 'on' + inflection.camelize(condition.type) + 'Condition'
        return self.callInterceptors(interceptor, [self, condition, query])
      })
    })

    return this.store.utils.parallel(calls)
  }

}







/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(query){      
      var conditions = this.getInternal('conditions') || []      
      return this._applyCondtions(conditions, query)
    }, -10)





    this.onHashCondition(function(chain, condition, query){
      const attribute = chain.definition.attributes[condition.attribute]
      const dataType = attribute.type

      if(!condition.operator){
        // get default operator
        condition.operator = dataType.operators.default
      }

      const operator = dataType.operators[condition.operator]

      if(!operator) throw new Error("Can't find a operator '" + condition.operator + "' for attribute '" + condition.attribute + "'")

      var value = condition.value
      var method    

      if(value && value.length === 0 && operator.nullifyEmptyArray !== false){
        value = null
      }

      var valueType = typeof value

      if(Array.isArray(value)) valueType = 'array'
      if(value instanceof Date) valueType = 'date'
      if(value instanceof Buffer) valueType = 'binary'
      if(value === null || value === undefined) valueType = 'null'
      if(valueType === 'object' && value.$attribute){
        const attributeDefinition = (value.$model || chain.model).definition.attributes[value.$attribute]
        valueType = 'attribute'
        if(attributeDefinition && attributeDefinition.type.array){
          valueType = 'attribute_array'
        }
                
        // convert attribute name
        value = chain.convertConditionAttribute(condition.value.$attribute, condition.value.$parents)
      }

      if(operator.on){
        if(typeof operator.on[valueType] === 'function') method = operator.on[valueType]
        if(operator.on[valueType] === true) method = operator.defaultMethod
        if(operator.on.all !== false && !method) method = operator.defaultMethod
      }else{
        method = operator.defaultMethod
      }
      
      if(!method) throw new Error("Operator '" + condition.operator + "' of attribute '" + condition.attribute + "' (type '" + attribute.type.name + "') can't process value of type '" + valueType + "'")

      // convert attribute name
      condition.attribute = chain.convertConditionAttribute(condition.attribute)

      if(query){
        return method.call(chain, condition.attribute, value, query, condition)
      }

      // see sql/group.js: 94
      return function(query){
        method.call(chain, condition.attribute, value, query, condition)
      }
    })
  }

}
