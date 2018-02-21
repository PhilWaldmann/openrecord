/*
 * MODEL
 */
exports.model = {
  /**
   * Include relations into the result
   * @class Model
   * @method include
   * @param {array} includes - array of relation names to include
   * @or
   * @param {object} includes - for nested includes use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  include: function(){
    const Utils = this.definition.store.utils

    var self = this.chain()
    var relations = Utils.sanitizeRelations(self, Utils.args(arguments))


    for(var i = 0; i < relations.length; i++){
      self.addInternal('includes', {
        relation: relations[i].relation,
        parent: relations[i].parent,
        name_tree: relations[i].name_tree,
        sub_includes: relations[i].sub_relations,
        as: relations[i].as,
        scope: relations[i].scope,
        args: relations[i].args
      })
    }

    return self
  }
}



/*
 * RECORD
 */
exports.record = {
  /**
   * Include relations into the result
   * @class Record
   * @method include
   * @param {array} includes - array of relation names to include
   * @or
   * @param {object} includes - for nested includes use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  include: function(){
    var model = this.definition.model
    var collection = model.include.apply(model, this.definition.store.utils.args(arguments))

    // add the current record to the collection
    collection.addInternal('data_loaded', [this.clearRelations()]) // clear relations for start with a clean record
    collection.setInternal('limit', 1)


    return collection
  }
}



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    const Utils = this.store.utils

    this.beforeFind(function(){
      var includes = this.getInternal('includes') || []
      var conditions = this.getInternal('conditions') || []
      var processed = this.getInternal('includes_processes')

      if(processed) return


      var processedRelations = []
      var includeTree = {}
      for(var i = 0; i < includes.length; i++){
        if(includes[i]){
          var relation = includes[i].relation
          var includeIdentifier = includes[i].name_tree.join('-')
          var tmp = []

          if(relation){
            // if there are multiple includes of the same relation - only take one
            if(processedRelations.indexOf(includeIdentifier) !== -1){
              includes.splice(i, 1)
              i--
              continue
            }

            processedRelations.push(includeIdentifier)

            // add all conditions which relate to the included relation
            for(var c = 0; c < conditions.length; c++){
              if(conditions[c] && conditions[c].name_tree.indexOf(relation.name) !== -1){
                var cond = Utils.clone(conditions[c])
                cond.name_tree.shift()
                tmp.push(cond)
                delete conditions[c]
              }
            }

            includes[i].conditions = tmp

            // convert the flatt includes list into a tree like structure
            // TODO: we get the whole thing as a tree like structure... so why are we doing this here?
            var pos = includes[i].name_tree.length - 1
            var parentName
            var parent

            includeTree[includes[i].name_tree.join('.')] = includes[i]

            do{
              parentName = includes[i].name_tree.slice(0, pos).join('.')
              parent = includeTree[parentName]
              pos--
            }while(!parent && pos > 0)

            if(parent){
              parent.child_includes = parent.child_includes || []
              parent.child_includes.push(includes[i])

              if(includes[i].as){
                var baseParent = includeTree[includes[i].name_tree[0]]
                var as = includes[i].as[0]
                var take = includes[i].name_tree.slice(1)

                if(includes[i].as.length > 1){
                  // freaky stuff... calucalte the new "as" name (last element)...
                  as = includes[i].as[includes[i].as.length - 1]
                  // ... caluclate the path to that element...
                  take = includes[i].name_tree.slice(includes[i].as.length)
                  // ... and get that include object for it
                  baseParent = includeTree[includes[i].name_tree.slice(0, includes[i].as.length).join('.')]
                }

                if(baseParent){
                  baseParent.take = baseParent.take || {}
                  baseParent.take[as] = take
                }
              }

              includes[i].name_tree = includes[i].name_tree.slice(-1)

              includes.splice(i, 1)
              i--
            }
          }
        }else{
          // just to make sure everything will go smooth - remove empty objects
          includes.splice(i, 1)
          i--
        }
      }
    }, -10)





    this.afterFind(function(data){
      this.logger.trace('persistent/include', data)
      var self = this
      var records = data.result
      var includes = self.getInternal('includes') || []
      var asJson = self.getInternal('as_json')

      if(!records) return

      var calls = []

      includes.forEach(function(include){
        // we dont need to do anything if we dont have any records - except it's a scope
        if(records.length === 0 && !include.scope) return // TODO: scopes on the base should be done in parallel to the initial find ... this is a little bit tricky, because is currently no way to call a function after everything (base query + scope) is ready...

        calls.push(function(){
          var cache = {}
          var Chains = []

          return self.callInterceptors('beforeInclude', [Chains, records, include, cache, data])
          .then(function(){
            var chainCalls = []

            Chains.forEach(function(Chain){
              chainCalls.push(function(includeDone){
                // add child includes
                if(include.child_includes){
                  Chain.addInternal('includes', include.child_includes)
                }

                // add polymorph/through includes
                if(include.sub_includes){
                  Chain.include(include.sub_includes)
                }

                if(asJson){
                  Chain.asJson()
                }

                return self.callInterceptors('onInclude', [Chain, records, include, cache, data])
                .then(function(){
                  return Chain.exec()
                })
                .then(function(result){
                  return self.callInterceptors('afterInclude', [Chain.definition.model, result, records, include, cache, data, Chain])
                })
              })
            })

            return self.store.utils.parallel(chainCalls)
          })
        })
      })

      return self.store.utils.parallel(calls)
    }, 80)








    this.beforeInclude(function(Chains, records, include, cache){
      if(Chains.length > 0) return // another interceptor has already done something
      if(!include.relation || include.scope) return // scopes do not have any relations - filter them out.


      var relation = include.relation
      var chain

      if(relation.polymorph && relation.type_key){
        var models = []

        for(var r = 0; r < records.length; r++){
          var modelName = records[r][relation.type_key]

          if(typeof relation.type_key === 'function'){
            modelName = relation.type_key(records[r])
          }

          if(modelName && models.indexOf(modelName) === -1){
            models.push(modelName)

            var Model = this.definition.store.Model(modelName)
            if(Model){
              chain = Model.chain()
              if(relation.scope && chain[relation.scope]) chain[relation.scope].apply(chain, include.args || [])
              Chains.push(chain)
            }
          }
        }
      }else{
        chain = relation.model.chain()

        if(relation.scope && chain[relation.scope]){
          chain[relation.scope].apply(chain, include.args || [])
        }
      }

      if(chain){
        if(relation.scope_per_record){
          // expensive!!
          for(var i = 0; i < records.length; i++){
            var clone = chain.clone()
            clone.setInternal('recordIndex', i)
            Chains.push(clone)
          }
        }else{
          Chains.push(chain)
        }
      }
    }, 100)




    this.onInclude(function(Chain, records, include, cache){
      if(!include.relation || include.scope) return // scopes do not have any relations - filter them out.

      var relation = include.relation
      var conditions = relation.conditions
      var condition = {}


      // add include conditions
      if(include.conditions){
        Chain.addInternal('conditions', include.conditions)
      }

      // loop over base conditions and replace attribute=attribute conditions with attribute = [ids,...]
      for(var base in conditions){
        if(conditions.hasOwnProperty(base) && conditions[base] && conditions[base].attribute){
          condition[base] = []

          var i = 0
          var length = records.length
          var dummyRecord

          if(conditions[base].model.definition.definedGetter[conditions[base].attribute]){
            // if our related ids for the next query will be produced by a user defined getter
            dummyRecord = conditions[base].model.new() // will covert values to the right format
          }

          if(relation.scope_per_record){
            i = Chain.getInternal('recordIndex')
            length = i + 1
          }

          for(i; i < length; i++){
            if(relation.polymorph){
              var modelName = records[i][relation.type_key]

              if(typeof relation.type_key === 'function'){
                modelName = relation.type_key(records[i])
              }
              if(modelName !== Chain.definition.model_name) continue
            }

            var id
            if(dummyRecord){
              dummyRecord.relations = {}
              dummyRecord.attributes = {}
              dummyRecord.set(records[i], 'read')
              id = dummyRecord[conditions[base].attribute]
            }else{
              id = records[i][conditions[base].attribute]
            }

            if(!Array.isArray(id)) id = [id]

            for(var x = 0; x < id.length; x++){
              if(id[x] && condition[base].indexOf(id[x]) === -1){
                condition[base].push(id[x])
              }
            }
          }
        }else{
          condition[base] = conditions[base]
        }
      }

      Chain.where(condition)
    })






    this.afterInclude(function(Model, result, records, include, cache, data, Chain){
      if(!include.relation) return // scopes do not have any relations - filter them out.

      if(result === null || result === undefined || result.length === 0) return
      if(!Array.isArray(result)) result = [result]

      var relation = include.relation
      var conditions = relation.conditions


      if(relation.scope_per_record){
        var index = Chain.getInternal('recordIndex')

        if(index !== undefined){
          if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
            records[index][relation.name] = result
          }else{
            records[index][relation.name] = result[0]
          }
        }

        return
      }

      if(Object.keys(conditions).length === 0) return

      // add result into records - based in the conditions - a kind of offline join
      for(var i = 0; i < result.length; i++){
        for(var r = 0; r < records.length; r++){
          var matches = 0
          var rules = 0

          // check all conditions for a match!
          for(var base in conditions){
            if(conditions.hasOwnProperty(base) && conditions[base] && conditions[base].attribute){
              var key1
              var key2 = result[i][base]
              var dummyRecord

              if(conditions[base].model.definition.definedGetter[conditions[base].attribute]){
                // if our related ids for the next query will be produced by a user defined getter
                dummyRecord = conditions[base].model.new() // will covert values to the right format
              }

              if(dummyRecord){
                dummyRecord.relations = {}
                dummyRecord.attributes = {}
                dummyRecord.set(records[r], 'read')
                key1 = dummyRecord[conditions[base].attribute]
              }else{
                key1 = records[r][conditions[base].attribute]
              }



              if(Array.isArray(key1) && Array.isArray(key2)){
                if(relation.contains === true){ // relation option: contains: true => check if there is at least on matching value, default => check strict equality
                  if(key1.filter(function(k){ return key2.indexOf(k) !== -1 }).length > 0){ // intersect
                    matches++
                  }
                }else{
                  if(key1.sort().toString() === key2.sort().toString()){ // strict equal
                    matches++
                  }
                }
              }else{
                if(Array.isArray(key1)){
                  if(key1.indexOf(key2) !== -1){ // key1 contains key2
                    matches++
                  }
                }else{
                  if(Array.isArray(key2)){
                    if(key2.indexOf(key1) !== -1){ // key2 contains key1
                      matches++
                    }
                  }else{
                    if(key1 === key2){ // key1 equal key2
                      matches++
                    }
                  }
                }
              }

              rules++
            }
          }

          if(relation.polymorph){
            var modelName = records[r][relation.type_key]

            if(typeof relation.type_key === 'function'){
              modelName = relation.type_key(records[r])
            }

            if(modelName === Model.definition.model_name) matches++
            rules++
          }


          if(matches === rules){
            if(relation.polymorph){
              // create a model, but only for polymoph relations.
              if(typeof result[i].set !== 'function'){
                result[i] = Model.new(result[i], 'read')
              }
            }

            if(include.take){
              for(var as in include.take){
                // TODO: check relation type as well (see below..)
                records[r][as] = records[r][as] || []
                var sr = result[i][include.take[as][0]]

                for(var t = 1; t < include.take[as].length; t++){
                  if(!sr) break
                  if(Array.isArray(sr)) sr = sr[0]
                  sr = sr[include.take[as][t]]
                }

                if(sr){
                  records[r][as].push(sr)
                }
              }
            }

            if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
              records[r][relation.name] = records[r][relation.name] || []
              records[r][relation.name].push(result[i])
            }else{
              records[r][relation.name] = records[r][relation.name] || result[i]
            }
          }
        }
      }
    }, 100)
  }
}
