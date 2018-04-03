const inflection = require('inflection')

exports.definition = {
  hasOne: function(name, options){
    const definition = this
    const utils = definition.store.utils
    
    options = options || {}
    options.type = 'has_one'

    
    options.preInitialize = options.preInitialize || function(){
      this.callParent() // converts model name to the model object
      
      const primaryKeys = definition.primaryKeys || []

      options.from = options.from || primaryKeys
      options.to = options.to || primaryKeys.map(function(key){
        return inflection.singularize(definition.getName().toLowerCase()) + '_' + key
      })
      
      
      // TODO: create magic attribute <relation_name>_ids = 2
    }

    // hasMany relation only returns a single record!
    options.transform = options.transform || function(result){
      if(!result) return
      return result[0] || null
    }


    options.setter = options.setter || function(record){
      if(this.relations[name] && record === this.relations[name][0]) return

      var chain = this.relations[name]

      // if no relational data exists (e.g. Parent.new())
      // create a new collection
      if(!chain){
        chain = options.model.chain()
        chain.setInternal('relation', options) // add the parent relation of this collection
        chain.setInternal('relation_to', this) // + the parent record
      }

      if(Array.isArray(record)) record = record[0]

      chain.remove(0)
      chain.add(record)
    }


    // add a single record
    options.add = options.add || function(parent, record){
      record.set(options.conditions) // add relation conditions to record. Will only work in `equality` conditions. e.g. {type: 'Foo'}
      options.to.forEach(function(key, index){
        const opposite = options.from[index]
        record[key] = parent[opposite]
      })

      options.setResult(parent, record.__chainedModel)
    }

    options.afterSave = options.afterSave || function(parent, saveOptions){
      const collection = parent.relations[name]
      if(collection){
        collection.forEach(function(record){
          // set new id on children
          options.add(parent, record)
        })

        return collection.save(saveOptions)
      }
    }

    options.afterDestroy = options.afterDestroy || function(parent, destroyOptions){
      const conditions = utils.recordsToConditions([parent], options.from, options.to)
      if(!conditions) return 

      const query = options.model.where(conditions)
      if(options.conditions) query.where(options.conditions) // conditions on the relation
      if(options.scope) query[options.scope]() // scope on the relation

      if(options.dependent === 'delete'){
        return query.deleteAll(destroyOptions)
      }
      if(options.dependent === 'destroy'){
        return query.destroyAll(destroyOptions)
      }
      if(options.dependent === 'nullify'){
        const update = {}
        options.to.forEach(function(key){
          update[key] = null
        })
        return query.updateAll(update, destroyOptions)
      }
    }


    // remove a single record
    options.remove = options.remove || function(parent, record){
      this._lazyOperation(function(){
        if(options.dependent === 'delete'){
          return record.delete()
        }
        if(options.dependent === 'destroy'){
          return record.destroy()
        }
        // nullify!        
        options.to.forEach(function(key){
          record[key] = null
        })
        return record.save()
      })
    }


    return this.relation(name, options)
  }
}
