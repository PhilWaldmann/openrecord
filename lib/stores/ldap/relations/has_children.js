const parseDN = require('ldapjs').parseDN

exports.definition = {
  hasChildren: function(name, options){
    options = options || {}
    
    options.bulkFetch = false
    if(!options.from){
      options.from = 'dn'
      options.to = options.to || 'parent_dn'
    }else{
      options.to = options.to || 'dn'
    }
    

    options.loadFromConditions = function(){ } // remove default behaviour of `hasMany` relation
    options.preInitialize = function(){      
      if(options.model) this.callParent()
    }

    options.collection = function(parentRecord){
      const chain = parentRecord.definition.model.chain({polymorph: true})
        
      chain.setInternal('relation', options) // add the parent relation of this collection
      chain.setInternal('relation_to', parentRecord) // + the parent record

      return chain
    }

    const definition = this
    options.loadFromRecord = options.loadFromRecord || function(parentRecord, include){ // TODO: bulk loading with loadFromRecords - if possible!      
      const jobs = []
      const dn = parentRecord[options.from[0]]
      
      if(Array.isArray(dn)){        
        dn.forEach(function(dn){
          jobs.push(getRecordByDN(dn, include))
        })
      }else{
        jobs.push(getRecordByDN(dn, include))
      }
      
      return definition.store.utils.parallel(jobs).then(function(results){
        // flatten
        results = [].concat.apply([], results)   
        // add the result to corresponding record
        parentRecord.relations[name] = options.filterCache(parentRecord, results)       
      })
    }


    function getRecordByDN(dn, include){
      if(!dn) return     
      const model = options.model || definition.model
      const chain = model.find(dn)
      
      if(options.conditions) chain.where(options.conditions) // conditions on the relation
      if(options.scope) chain[options.scope].apply(chain, include.args) // scope on the relation
      if(include.conditions) chain.where(include.conditions) // nested conditions via `where({relation_name: {...conditions...}})`
      if(include.children) chain.include(include.children) // nested includes via `include({relation_name: {nested_relation_name: { ... }}})`
      if(include.scope) chain[include.scope].apply(chain, include.args) // scope defined via `include({relation_name: {$scope: 'myscope'}})`

      chain.setInternal('without_object_class', true) // don't add objectClass=ou - so we get all objects
      chain.select(definition.store.getAllAvailableAttributes()) // we need to add all needed attribute to that request to make sure every record has everything loaded
      chain.recursive(options.recursive === true)
      if(!options.model) chain.asRaw()

      return chain
    }



    options.filterCache = options.filterCache || function(parentRecord, records){
      const chain = parentRecord.definition.model.chain({polymorph: true})

      if(records){        
        if(!Array.isArray(records)) records = [records]
        const relatedRecords = records.filter(function(record){
          if(!record) return

          var dn = record[options.to[0]]
          if(options.to[0] === 'parent_dn') dn = record.dn
          
          if(!dn) return

          if(!Array.isArray(dn)) dn = [dn]
          
          return definition.store.utils.normalizeDn(dn.map(function(dn){
            if(options.to[0] === 'parent_dn') return parseDN(dn).parent()
            return dn
          }))
          .map(function(dn){
            return definition.store.utils.checkFieldEquality(parentRecord[options.from[0]], dn)
          }).indexOf(true) !== -1
        })
        .map(function(record){
          // convert to model record
          const RecordModel = definition.store.getByObjectClass(record.objectClass)
          if(!RecordModel) throw new Error('No Model for objectClass: ' + record.objectClass)
          return RecordModel.new(record, 'read')
        })
                
        chain.add(relatedRecords) // add all child records
        chain._exists() // set this collection as existing (all records fetched from the datastore!)
      }

      return chain
    }


    options.afterSave = function(parent, saveOptions){
      const collection = parent.relations[name]
      if(collection){
        collection.forEach(function(record){
          // set parent dn          
          record.parent_dn = parent.dn
        })        
        return collection.save(saveOptions)
      }      
    }


    return this.hasMany(name, options)
  }
}