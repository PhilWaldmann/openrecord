const debug = require('debug')('openrecord:save')

/*
 * CHAIN
 */
exports.chain = {
  _create: function(options) {
    const Store = require('../../store')

    var self = this
    var query = this.definition.query(options)

    // get all new records
    const newRecords = this.filter(function(record) {
      return !record.__exists
    })

    if (newRecords.length === 0) return Promise.resolve()

    return Promise.all(
      newRecords.map(function(record) {
        return record
          .callInterceptors('beforeSave', [record, options])
          .then(function() {
            return record.callInterceptors('beforeCreate', [record, options])
          })
      })
    )
      .then(function() {
        // now save all records with a single `INSERT`
        var primaryKeys = self.definition.primaryKeys
        var primaryKey = primaryKeys[0]
        var values = newRecords.map(function(record) {
          var changes = record.getChangedValues()
          var value = {}
          for (var name in self.definition.attributes) {
            var attr = self.definition.attributes[name]

            if (attr.persistent && changes.hasOwnProperty(name)) {
              value[name] = self.definition.cast(
                name,
                changes[name],
                'write',
                record
              )
            }
          }
          return value
        })

        return query
          .returning(primaryKey)
          .insert(values)
          .catch(function(error) {
            debug(query.toString())
            throw new Store.SQLError(error)
          })
          .then(function(result) {
            debug(query.toString())
            options.ignore = []
            newRecords.forEach(function(record, index) {
              var idTmp = {}
              idTmp[primaryKey] = result[index]

              record.set(idTmp, 'read')
              record._exists({ relations: false })

              options.ignore.push(record)
            })
          })
      })
      .then(function() {
        return Promise.all(
          newRecords.map(function(record) {
            return record
              .callInterceptors('afterCreate', [record, options])
              .then(function() {
                return record.callInterceptors('afterSave', [record, options])
              })
          })
        )
      })
  }
}
