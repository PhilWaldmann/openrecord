exports.definition = {
  has: function(name, options) {
    const store = this.store
    options = options || {}
    options.type = 'has'

    options.preInitialize = options.preInitialize || function() {}
    options.initialize = options.initialize || function() {}

    options.loadFromConditions = options.loadFromConditions || function(){
      return undefined
    }

    if(!options.loadFromRecords && !options.query) throw new Error('You need to implement a `query(store, parentRecords)` method!')

    options.loadFromRecords = options.loadFromRecords || function(parentCollection){
      return options.query(store, parentCollection)
      .then(function(result) {
        // add the result to corresponding record
        parentCollection.forEach(function(record) {
          record.relations[name] = options.convert(record, result)
        })

        return result
      })
    }

    options.loadFromRecord = options.loadFromRecord || function(parentRecord){
      return options.query(store, [parentRecord])
      .then(function(result) {
        parentRecord.relations[name] = options.convert(parentRecord, result)
        return result
      })
    }

    if(!options.filterCache && !options.convert) throw new Error('You need to implement a `convert(parent, results)` method!')

    options.filterCache = options.filterCache || function(parentRecord, records){
      return options.convert(parentRecord, records)
    }

    options.collection = options.collection || function(parentRecord){
      return options.convert(parentRecord, null)
    }

    options.getter = options.getter || function() {
      return this['_' + name]
    }


    return this.relation(name, options)
  }
}
