var position = 'position'

exports.migration = {
  sortedList: function() {
    this.integer(position)
  }
}

exports.definition = {
  sortedList: function(config) {
    var self = this
    config = config || {}

    if (config.scope && !Array.isArray(config.scope))
      config.scope = [config.scope]

    // before find - add position sorting
    this.beforeFind(function() {
      if (config.scope) {
        for (var i = 0; i < config.scope.length; i++) {
          this.order(config.scope[i])
        }
      }

      this.order(position)
    })

    // before save: calculate new position for new records
    this.beforeSave(function(record, options) {
      var primaryKeys = self.primaryKeys
      var condition = {}
      var i

      for (i = 0; i < primaryKeys.length; i++) {
        if (this[primaryKeys[i]]) {
          condition[primaryKeys[i] + '_not'] = this[primaryKeys[i]]
        }
      }

      if (config.scope) {
        for (i = 0; i < config.scope.length; i++) {
          condition[config.scope[i]] = this[config.scope[i]]
        }
      }

      if (record[position] !== null) {
        // check position

        if (record[position] < 0) record[position] = 0

        return self.model
          .useTransaction(options.transaction)
          .max(position)
          .where(condition)
          .exec(function(result) {
            if (record[position] > record + 1) {
              record[position] = result + 1
            }
          })
      } else {
        // non existing position
        if (config.insert === 'beginning') {
          record[position] = 0
        } else {
          return self.model
            .useTransaction(options.transaction)
            .max(position)
            .where(condition)
            .exec(function(result) {
              if (isNaN(result)) result = -1 // no entry in table
              record[position] = result + 1
            })
        }
      }
    })

    this.afterSave(function(record, options) {
      if (record.hasChanged(position)) {
        var before = record.changes[position][0]
        var tmp = self.query(options)

        if (config.scope) {
          for (var i = 0; i < config.scope.length; i++) {
            tmp.where(config.scope[i], '=', record[config.scope[i]])
          }
        }

        if (before === undefined) before = null

        if (before === null || before > record[position]) {
          tmp.where(position, '>=', record[position])
          tmp.where('id', '!=', record.id)

          if (before !== null) {
            tmp.where(position, '<', before)
          }

          return tmp.increment(position, 1)
        } else {
          tmp.where(position, '<=', record[position])
          tmp.where('id', '!=', record.id)
          tmp.where(position, '>', before)

          return tmp.increment(position, -1)
        }
      }
    })

    this.afterSave(function(record, options) {
      if (config.scope) {
        var scopeChanged = false
        var tmp = self.query(options)

        if (record.hasChanged()) {
          tmp.where(position, '>', record.changes[position][0])
        } else {
          tmp.where(position, '>', record[position])
        }

        for (var i = 0; i < config.scope.length; i++) {
          if (record.hasChanged(config.scope[i])) {
            scopeChanged = true
            tmp.where(config.scope[i], '=', record.changes[config.scope[i]][0])
          } else {
            tmp.where(config.scope[i], '=', record[config.scope[i]])
          }
        }

        if (scopeChanged) {
          return tmp.increment(position, -1)
        }
      }
    })

    this.afterDestroy(function(record, options) {
      var tmp = self.query(options)
      tmp.where(position, '>', record[position])

      if (config.scope) {
        for (var i = 0; i < config.scope.length; i++) {
          tmp.where(config.scope[i], '=', record[config.scope[i]])
        }
      }

      return tmp.increment(position, -1)
    })

    return this
  }
}
