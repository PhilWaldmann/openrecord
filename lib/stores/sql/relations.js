
/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    var beforeHook = function(record, options){
      record = this
      var tmp = []
      var i

      for(i in self.relations){
        var relation = self.relations[i]
        if(relation.type.through) continue

        if(relation.type === 'belongs_to' && !relation.through){
          if(record[relation.name] && record[relation.name].hasChanges()){
            (function(relation){
              tmp.push(function(){
                return record[relation.name].save(options)
                .then(function(){
                  for(var base in relation.conditions){
                    if(relation.conditions[base] && relation.conditions[base].attribute && !record.hasChanged(relation.conditions[base].attribute)){ // check if the relation id was manually changed
                      record[relation.conditions[base].attribute] = record[relation.name][base]
                    }
                  }
                })
              })
            })(relation)
          }
        }



        if(relation.type === 'belongs_to_many' && !relation.through){
          if(record.relations[relation.name] && record.relations[relation.name].length > 0){
            for(i = 0; i < record[relation.name].length; i++){
              if(record[relation.name][i] && record[relation.name][i].hasChanges()){
                (function(relation, subrecord){
                  tmp.push(function(){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute){
                        subrecord[base] = record[relation.conditions[base].attribute]
                      }
                    }

                    return subrecord.save(options)
                  })
                })(relation, record[relation.name][i])
              }
            }
          }
        }
      }

      return self.store.utils.parallel(tmp)
    }







    var afterHook = function(record, options){
      var tmp = []
      var thisRecord = this

      for(var i in self.relations){
        var relation = self.relations[i]
        if(relation.type.through) continue

        if(relation.type === 'has_many' && !relation.through){
          if(this.relations[relation.name] && this.relations[relation.name].length > 0){
            for(var j = 0; j < this[relation.name].length; j++){
              if(this[relation.name][j] && this[relation.name][j].hasChanges()){
                (function(relation, subrecord){
                  tmp.push(function(){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute){
                        subrecord[base] = record[relation.conditions[base].attribute]
                      }
                    }

                    return subrecord.save(options)
                  })
                })(relation, this[relation.name][j])
              }
            }
          }
        }


        if(relation.type === 'has_one' && !relation.through){
          if(this[relation.name] && this[relation.name].hasChanges()){
            (function(relation){
              tmp.push(function(){
                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    thisRecord[relation.name][base] = record[relation.conditions[base].attribute]
                  }
                }

                return thisRecord[relation.name].save(options)
              })
            })(relation)
          }
        }
      }

      return this.store.utils.series(tmp)
    }

    // TODO: use beforeSave and afterSave !?
    this.beforeCreate(beforeHook, 100)
    this.beforeUpdate(beforeHook, 100)
    this.afterCreate(afterHook, 100)
    this.afterUpdate(afterHook, 100)





    this.afterDestroy(function(record, options){
      var tmp = []

      for(var i in self.relations){
        var relation = self.relations[i];

        (function(relation){
          if(relation.dependent === 'destroy' || relation.dependent === 'delete'){
            tmp.push(function(){
              if(relation.type === 'has_many'){
                return record[relation.name][relation.dependent](options) // delete() or destroy()
              }else{
                var conditions = {}

                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    conditions[base] = record[relation.conditions[base].attribute]
                  }else{
                    conditions[base] = relation.conditions[base]
                  }
                }

                return relation.model.where(conditions).transaction(options.transaction).limit(1).exec(function(subrecord){
                  if(subrecord){
                    return subrecord[relation.dependent](options) // delete() or destroy()
                  }
                })
              }
            })
          }

          if(relation.dependent === 'nullify'){
            tmp.push(function(){
              if(relation.type === 'has_many' || relation.type === 'has_one'){ // TODO: add hasOne as well!
                var attrs = {}

                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    attrs[base] = null
                  }
                }

                return record[relation.name].updateAll(attrs, options)
              }
            })
          }
        })(relation)
      }

      return this.store.utils.series(tmp)
    }, 100)
  }
}
