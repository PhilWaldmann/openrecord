
exports.definition = {


  relation: function(name, options){
    options = options || {}
    const utils = this.store.utils

    options.afterDestroy = function(parent, destroyOptions){  
      if(options.dependent === 'destroy'){
        return parent[name]
        .then(function(records){
          const jobs = []
          records.forEach(function(record){
            jobs.push(function(){
              return record.destroy()
            })
          })
          return utils.parallel(jobs)
        })
      }
    }

    this.callParent(name, options)
  },

  belongsTo: function(name, options){
    options = options || {}
    if(!options.to) options.to = 'dn'
    return this.callParent(name, options)
  }
  

  /*
  mixinCallback: function(){
    var self = this


    this.beforeSave(function(record, options){
      record = this
      var tmp = []
      var i

      for(i in self.relations){
        var relation = self.relations[i]
        if(relation.through) continue
        if(!relation.autoSave) continue

        if(relation.type === 'belongs_to'){
          if(record[relation.name]){
            (function(relation){ // TODO: beforeRelationSave and afterRelationSafe
              tmp.push(function(){
                return record[relation.name].save()
                .then(function(relatedRecord){
                  if(relation.from && relation.to){
                    record[relation.from] = relatedRecord[relation.to]
                  }

                  if(relation.ldap === 'parent'){
                    record.parent_dn = relatedRecord.dn
                  }
                })
              })
            })(relation)
          }
        }


        if(relation.type === 'belongs_to_many'){
          if(record[relation.name] && record[relation.name].length > 0){
            for(i = 0; i < record[relation.name].length; i++){
              (function(relation, subrecord){
                tmp.push(function(){
                  return subrecord.save()
                  .then(function(relatedRecord){
                    if(relation.from && relation.to){
                      record[relation.from] = relatedRecord[relation.to]
                    }

                    if(relation.ldap){
                      record[relation.ldap] = subrecord.dn
                    }
                  })
                })
              })(relation, record[relation.name][i])
            }
          }
        }
      }

      return this.store.utils.parallel(tmp)
    }, 100)


    this.afterSave(function(record, options){
      var tmp = []
      var thisRecord = this

      for(var i in self.relations){
        var relation = self.relations[i]
        if(relation.through) continue
        if(!relation.autoSave) continue

        if(relation.type === 'has_many'){
          if(this.relations[relation.name] && this.relations[relation.name].length > 0){
            for(var j = 0; j < this[relation.name].length; j++){
              (function(relation, subrecord){
                tmp.push(function(){
                  if(relation.from && relation.to){
                    subrecord[relation.to] = record[relation.from]
                  }

                  if(relation.ldap === 'children'){
                    subrecord.parent_dn = record.dn
                  }

                  return subrecord.save()
                })
              })(relation, this[relation.name][j])
            }
          }
        }


        if(relation.type === 'has_one'){
          if(this[relation.name]){
            (function(relation){
              tmp.push(function(){
                if(relation.from && relation.to){
                  thisRecord[relation.name][relation.to] = record[relation.from]
                }

                return thisRecord[relation.name].save()
              })
            })(relation)
          }
        }
      }

      return this.store.utils.series(tmp)
    }, 100)
  }
  */
}
