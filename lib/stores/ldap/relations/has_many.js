exports.definition = {
  hasMany: function(name, options) {
    options = options || {}
    if (!options.from) options.from = 'dn'

    const definition = this
    const utils = definition.store.utils

    options.setter =
      options.setter ||
      function(records) {
        if (records === this.relations[name]) return

        var chain = this.relations[name]

        // if no relational data exists (e.g. Parent.new())
        // create a new collection
        if (!chain) {
          chain = definition.model.chain({ polymorph: true })
          chain.setInternal('relation', options) // add the parent relation of this collection
          chain.setInternal('relation_to', this) // + the parent record
          chain._resolved()
        }

        // lazy remove unused child records (triggered on save by the parent record!)
        const recordsToRemove = utils.distinctRecords(chain, records, ['dn'])

        chain.setInternal('__clear_only', recordsToRemove)
        chain.clear()
        chain.add(records)
      }

    options.clear = function(parent, collection) {
      const records = collection.getInternal('__clear_only') || collection
      if (!records || records.length === 0) return

      collection.clearInternal('__clear_only')

      parent.relations[name]._lazyOperation(function(transOptions) {
        if (options.dependent === 'destroy') {
          const jobs = []
          records.forEach(function(record) {
            jobs.push(function() {
              return record.destroy(transOptions)
            })
          })
          return utils.parallel(jobs)
        }
      })

      // remove record from collection
      records.forEach(function(record) {
        const index = collection.indexOf(record)
        collection.splice(index, 1)
      })
    }

    return this.callParent(name, options)
  }
}
