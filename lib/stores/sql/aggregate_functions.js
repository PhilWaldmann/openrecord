/*
 * MODEL
 */
exports.model = {
  aggregate: function(method, field) {
    var self = this.chain().asRaw()
    self.setInternal(method, field || '*')
    self.setInternal('no_relation_cache', true)
    self.setInternal('has_aggegrates', true)
    self.singleResult(false)
    return self
  },

  /**
   * Count the number of records in the database (SQL: `COUNT()`)
   *
   * @class Model
   * @method count
   * @param {string} field - Optional field name. (Default: `*`)
   * @param {boolean} distinct - Optional: DISTINCT(field). (Default: false)
   * @return {Model}
   * @see Model.exec()
   */
  count: function(field, distinct) {
    var self = this.aggregate('count', field || '*')
    self.setInternal('count_distinct', distinct || false)
    return self
  },

  /**
   * Calculates the sum of a certain field (SQL: `SUM()`)
   *
   * @class Model
   * @method sum
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  sum: function(field) {
    return this.aggregate('sum', field)
  },

  /**
   * Calculates the maximum value of a certain field (SQL: `MAX()`)
   *
   * @class Model
   * @method max
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  max: function(field) {
    return this.aggregate('max', field)
  },

  /**
   * Calculates the minimum value of a certain field (SQL: `MIN()`)
   *
   * @class Model
   * @method min
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  min: function(field) {
    return this.aggregate('min', field)
  },

  /**
   * Calculates the average value of a certain field (SQL: `AVG()`)
   *
   * @class Model
   * @method avg
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  avg: function(field) {
    return this.aggregate('avg', field)
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    var self = this

    this.beforeFind(function(query) {
      const aggFns = ['count', 'sum', 'min', 'max', 'avg']
      const countDistinct = this.getInternal('count_distinct')

      for (var i in aggFns) {
        var tmp = this.getInternal(aggFns[i])

        if (tmp) {
          if (aggFns[i] === 'count' && countDistinct) {
            query.select(
              self.store.connection.raw('count(distinct(' + tmp + ')) as count')
            )
          } else {
            query[aggFns[i]](tmp + ' as ' + aggFns[i])
          }
        }
      }
    }, -10)

    this.afterFind(function(data) {
      const hasAggregates = this.getInternal('has_aggegrates')

      if (!hasAggregates) return

      var count = this.getInternal('count')
      var sum = this.getInternal('sum')
      var min = this.getInternal('min')
      var max = this.getInternal('max')
      var avg = this.getInternal('avg')

      if ((count || sum || min || max || avg) && data.result.length <= 1) {
        if (data.result.length === 0) {
          data.result = 0
          return true
        }

        data.result = data.result[0]
        if (!data.result) return

        const result = {}
        const aggFns = ['count', 'sum', 'min', 'max', 'avg']
        var fns = 0
        var lastFn

        const keys = Object.keys(data.result)
        if(keys.length > 1) return


        keys.forEach(function(key) {
          const lowerKey = key.toLocaleLowerCase()
          if (aggFns.indexOf(lowerKey) !== -1) {
            var tmp = parseFloat(data.result[key])
            if(isNaN(tmp)) tmp = data.result[key]
            result[lowerKey] = tmp
            fns++
            lastFn = lowerKey
          }
        })

        data.result = result

        if (fns === 1) {
          data.result = data.result[lastFn]
        }
      }
    }, 70)
  }
}
