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
  find: function() {
    var self = this.chain()
    var args = this.definition.store.utils.args(arguments)
    var primaryKeys = self.definition.primaryKeys

    var where = {}
    var callback
    var findOne = true

    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop()
    }
    
    if (args.length === primaryKeys.length) {
      var validKey = false

      for (var i = 0; i < primaryKeys.length; i++) {
        if (args[i]) {
          where[primaryKeys[i]] = args[i]
          validKey = true
          if (Array.isArray(args[i])) {
            findOne = false
          }
        }
      }
      if(validKey) args = [where]
    }

    if (callback) {
      args.push(callback)
    }

    // if null was given to find!
    if (args.length === 0 || (args.length === 1 && (args[0] === null || args[0] === undefined))) {
      self.addInternal('exec_null', true)
      return self
    }

    if (findOne) self.singleResult()

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
  get: function() {
    var self = this.chain()
    return self.expectResult().find.apply(self, arguments)
  },

  /**
   * Set some conditions
   *
   * @public
   * @memberof Model
   * @method where
   * @param {(object|array)} conditions - every key-value pair will be translated into a condition
   *
   * @return {Model}
   */
  where: function() {
    const Utils = this.definition.store.utils
    const self = this.chain()._unresolve() // if the collection is already resolved, return a unresolved and empty copy!

    const existingConditions = self.getInternal('conditions') || []
    const existingMap = {}

    existingConditions.forEach(function(cond) {
      const key =
        cond.type +
        '|' +
        cond.attribute +
        '|' +
        cond.operator +
        '|' +
        JSON.stringify(cond.value)
      existingMap[key] = true
    })

    var attributeNames = Object.keys(self.definition.attributes)

    attributeNames = attributeNames.concat(attributeNames.map(function(name){
      return self.definition.attributes[name].name
    }))

    const parentRelations = self.getInternal('parent_relations')
    const conditions = Utils.toConditionList(
      Utils.args(arguments),
      attributeNames
    )

    conditions.forEach(function(cond) {
      if (
        cond.type === 'relation' &&
        !self.definition.relations[cond.relation] &&
        !self.options.polymorph
      ) {
        throw new Error(
          'Can\'t find attribute or relation "' +
            cond.relation +
            '" for ' +
            self.definition.modelName
        )
      }
      // used for joins only
      if (parentRelations) {
        cond.parents = parentRelations
        if (cond.value && cond.value.$attribute && !cond.value.$parents) {
          cond.value.$parents = parentRelations
        }
      }

      if(cond.attribute) cond.attribute = self.store.toInternalAttributeName(cond.attribute)

      const key =
        cond.type +
        '|' +
        cond.attribute +
        '|' +
        cond.operator +
        '|' +
        JSON.stringify(cond.value)
      if (existingMap[key] && cond.type !== 'raw') return

      self.addInternal('conditions', cond)
    })

    return self
  },

  _applyCondtions: function(conditions, query) {
    var self = this
    var calls = []

    conditions.forEach(function(condition) {
      if (!condition) return
      calls.push(function() {
        var interceptor =
          'on' + inflection.camelize(condition.type) + 'Condition'
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
  mixinCallback: function() {
    this.beforeFind(function(query) {
      var conditions = this.getInternal('conditions') || []
      return this._applyCondtions(conditions, query)
    }, -10)

    this.onHashCondition(function(chain, condition, query) {
      const attribute = chain.definition.attributes[condition.attribute]
      if (!attribute)
        throw new Error(
          "Unknown attribute '" +
            condition.attribute +
            "' on model '" +
            chain.definition.modelName +
            "'"
        )
      const dataType = attribute.type

      if (!condition.operator) {
        // get default operator
        condition.operator = dataType.operators.default
      }

      const operator = dataType.operators[condition.operator]

      if (!operator)
        throw new Error(
          "Can't find a operator '" +
            condition.operator +
            "' for attribute '" +
            condition.attribute +
            "'"
        )

      var value = condition.value
      var method

      if (value && value.length === 0 && operator.nullifyEmptyArray !== false) {
        value = null
      }

      var valueType = typeof value

      if (Array.isArray(value)) valueType = 'array'
      if (value instanceof Date) valueType = 'date'
      if (value instanceof Buffer) valueType = 'binary'
      if (value === null || value === undefined) valueType = 'null'
      if (valueType === 'object' && value.$attribute) {
        const attributeDefinition = (value.$model || chain.model).definition
          .attributes[value.$attribute]
        valueType = 'attribute'
        if (attributeDefinition && attributeDefinition.type.array) {
          valueType = 'attribute_array'
        }

        // convert attribute name
        value = chain.convertConditionAttribute(
          condition.value.$attribute,
          condition.value.$parents
        )
      } else {
        if (typeof dataType.cast.condition === 'function') {
          value = dataType.cast.condition(value)
        }
      }

      if (operator.on) {
        if (typeof operator.on[valueType] === 'function')
          method = operator.on[valueType]
        if (operator.on[valueType] === true) method = operator.defaultMethod
        if (operator.on.all !== false && !method)
          method = operator.defaultMethod
      } else {
        method = operator.defaultMethod
      }

      if (!method)
        throw new Error(
          "Operator '" +
            condition.operator +
            "' of attribute '" +
            condition.attribute +
            "' (type '" +
            attribute.type.name +
            "') can't process value of type '" +
            valueType +
            "'"
        )

      // convert attribute name
      condition.attribute = chain.convertConditionAttribute(condition.attribute)

      if (query) {
        return method.call(chain, condition.attribute, value, query, condition)
      }

      // see sql/group.js: 94
      return function(query) {
        method.call(chain, condition.attribute, value, query, condition)
      }
    })
  }
}
