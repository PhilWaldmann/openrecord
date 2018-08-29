/*
 * MODEL
 */
exports.model = {
  /**
   * Set a sort order
   * @class Model
   * @method order
   * @param {array} columns - Array of field fro the sort.
   * @param {boolean} desc - Optional: Set to `true` to order descent
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  order: function(columns, desc) {
    var self = this.chain()

    if (columns) {
      if (typeof desc === 'boolean') {
        if (!Array.isArray(columns)) columns = [columns]
      } else {
        columns = [].concat.apply(
          [],
          this.definition.store.utils.args(arguments)
        )
        desc = false
      }

      for (var i in columns) {
        self.addInternal('order', {
          column: self.store.toInternalAttributeName(columns[i]),
          order: desc ? 'DESC' : 'ASC'
        })
      }
    } else {
      self.clearInternal('order')
    }

    return self
  },

  sort: function() {
    return this.order.apply(this, arguments)
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.beforeFind(function(query) {
      var order = this.getInternal('order')

      // check if there was an aggregate function called
      var aggFns = ['count', 'sum', 'min', 'max', 'avg']
      var i

      for (i in aggFns) {
        if (this.getInternal(aggFns[i])) {
          return
        }
      }

      if (order) {
        for (i in order) {
          var attribute = order[i].column
          var tmp = attribute.split('.')

          if (tmp.length > 1) {
            if (this.definition.attributes[tmp[0]]) {
              if (
                typeof this.definition.attributes[tmp[0]].type.sorter ===
                'function'
              ) {
                attribute = this.definition.attributes[tmp[0]].type.sorter.call(
                  this,
                  attribute
                )
              }
            }
          }

          if (typeof attribute === 'string' && attribute.match(/\(/)) {
            query.orderBy(this.store.connection.raw(attribute), order[i].order)
          } else {
            query.orderBy(attribute, order[i].order)
          }
        }
      }

      return true
    }, -60)
  }
}
