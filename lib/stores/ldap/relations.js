exports.definition = {

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
                  if(relation.primary_key && relation.foreign_key){
                    record[relation.primary_key] = relatedRecord[relation.foreign_key]
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
                    if(relation.primary_key && relation.foreign_key){
                      record[relation.primary_key] = relatedRecord[relation.foreign_key]
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
                  if(relation.primary_key && relation.foreign_key){
                    subrecord[relation.foreign_key] = record[relation.primary_key]
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
                if(relation.primary_key && relation.foreign_key){
                  thisRecord[relation.name][relation.foreign_key] = record[relation.primary_key]
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
}
