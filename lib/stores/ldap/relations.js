exports.definition = {
  relation: function(name, options) {
    options = options || {}
    const utils = this.store.utils

    options.afterDestroy = function(parent, transOptions) {
      if (options.dependent === 'destroy') {
        return parent[name].then(function(records) {
          const jobs = []
          records.forEach(function(record) {
            jobs.push(function() {
              return record.destroy(transOptions)
            })
          })
          return utils.parallel(jobs)
        })
      }
    }

    this.callParent(name, options)
  },

  belongsTo: function(name, options) {
    options = options || {}
    if (!options.to) options.to = 'dn'
    return this.callParent(name, options)
  }
}
