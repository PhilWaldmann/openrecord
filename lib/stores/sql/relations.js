var async = require('async')


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this

    var beforeHook = function(record, transaction, next){
      record = this
      var tmp = []
      var i

      for(i in self.relations){
        var relation = self.relations[i]
        if(relation.type.through) continue

        if(relation.type === 'belongs_to' && !relation.through){
          if(record[relation.name] && record[relation.name].hasChanges()){
            (function(relation){
              var validates = true
              if(relation.validates === false) validates = false
              if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(record[relation.name].__exists ? 'update' : 'destroy') !== -1

              tmp.push(function(done){
                record[relation.name].save({transaction: transaction}, function(okay){
                  if(okay || !validates){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute && !record.hasChanged(relation.conditions[base].attribute)){ // check if the relation id was manually changed
                        record[relation.conditions[base].attribute] = this[base]
                      }
                    }

                    return done()
                  }
                  done('STOP')
                }, done)
              })
            })(relation)
          }
        }



        if(relation.type === 'belongs_to_many' && !relation.through){
          if(record.relations[relation.name] && record.relations[relation.name].length > 0){
            for(i = 0; i < record[relation.name].length; i++){
              if(record[relation.name][i] && record[relation.name][i].hasChanges()){
                (function(relation, subrecord){
                  var validates = true
                  if(relation.validates === false) validates = false
                  if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(subrecord.__exists ? 'update' : 'destroy') !== -1

                  tmp.push(function(done){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute){
                        subrecord[base] = record[relation.conditions[base].attribute]
                      }
                    }

                    subrecord.save({transaction: transaction}, function(okay){
                      if(okay || !validates){
                        return done()
                      }
                      done('STOP')
                    }, done)
                  })
                })(relation, record[relation.name][i])
              }
            }
          }
        }
      }

      if(tmp.length === 0){
        return next(true)
      }

      async.parallel(tmp, function(err){
        if(err === 'STOP') err = false
        next(err)
      })
    }


    var afterHook = function(record, transaction, next){
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
                  var validates = true
                  if(relation.validates === false) validates = false
                  if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(subrecord.__exists ? 'update' : 'destroy') !== -1

                  tmp.push(function(done){
                    for(var base in relation.conditions){
                      if(relation.conditions[base] && relation.conditions[base].attribute){
                        subrecord[base] = record[relation.conditions[base].attribute]
                      }
                    }

                    subrecord.save({transaction: transaction}, function(okay){
                      if(okay || !validates){
                        return done()
                      }
                      done('STOP')
                    }, done)
                  })
                })(relation, this[relation.name][j])
              }
            }
          }
        }


        if(relation.type === 'has_one' && !relation.through){
          if(this[relation.name] && this[relation.name].hasChanges()){
            (function(relation){
              var validates = true
              if(relation.validates === false) validates = false
              if(Array.isArray(relation.validates)) validates = relation.validates.indexOf(thisRecord[relation.name].__exists ? 'update' : 'destroy') !== -1

              tmp.push(function(done){
                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    thisRecord[relation.name][base] = record[relation.conditions[base].attribute]
                  }
                }

                thisRecord[relation.name].save({transaction: transaction, commit: false}, function(okay){
                  if(okay || !validates){
                    return done()
                  }
                  done('STOP')
                }, done)
              })
            })(relation)
          }
        }
      }

      if(tmp.length === 0){
        return next(true)
      }

      async.series(tmp, function(err){
        if(err === 'STOP') err = false
        next(err)
      })
    }

    // TODO: use beforeSave and afterSave !?
    this.beforeCreate(beforeHook, 100)
    this.beforeUpdate(beforeHook, 100)
    this.afterCreate(afterHook, 100)
    this.afterUpdate(afterHook, 100)





    this.afterDestroy(function(record, transaction, next){
      var tmp = []

      for(var i in self.relations){
        var relation = self.relations[i];

        (function(relation){
          var validates = true
          if(relation.validates === false) validates = false
          if(Array.isArray(relation.validates)) validates = relation.validates.indexOf('destroy') !== -1

          if(relation.dependent === 'destroy' || relation.dependent === 'delete'){
            tmp.push(function(done){
              if(relation.type === 'has_many'){
                record[relation.name][relation.dependent]({transaction: transaction, rollback: false, commit: false}, function(success){
                  if(!success && validates) return done('STOP')
                  done()
                }, done)
              }else{
                var conditions = {}

                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    conditions[base] = record[relation.conditions[base].attribute]
                  }else{
                    conditions[base] = relation.conditions[base]
                  }
                }

                relation.model.where(conditions).transaction(transaction).limit(1).exec(function(subrecord){
                  if(subrecord){
                    subrecord[relation.dependent]({transaction: transaction, rollback: false, commit: false}, function(success){
                      if(!success && validates) return done('STOP')
                      done()
                    }, done)
                  }else{
                    done()
                  }
                })
              }
            })
          }

          if(relation.dependent === 'nullify'){
            tmp.push(function(done){
              if(relation.type === 'has_many' || relation.type === 'has_one'){ // TODO: add hasOne as well!
                var attrs = {}

                for(var base in relation.conditions){
                  if(relation.conditions[base] && relation.conditions[base].attribute){
                    attrs[base] = null
                  }
                }

                record[relation.name].updateAll(attrs, {transaction: transaction, rollback: false, commit: false}, function(success){
                  if(!success && validates) return done('STOP')
                  done()
                }, done)
              }
            })
          }
        })(relation)
      }

      if(tmp.length === 0){
        return next(true)
      }

      async.series(tmp, function(err){
        if(err === 'STOP') err = false
        next(err)
      })
    }, 100)
  }
}
