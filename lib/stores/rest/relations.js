
/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this


    this.beforeSave(function(record, options){
      record = this
      var tmp = []

      for(var i in self.relations){
        var relation = self.relations[i]
        if(relation.type.through) continue

        if(relation.type === 'belongs_to' && !relation.through){
          if(record[relation.name]){
            (function(relation){
              tmp.push(function(done){
                return record[relation.name].save()
                .then(function(relatedRecord){
                  record[relation.primary_key] = relatedRecord[relation.foreign_key]
                })
              })
            })(relation)
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
        if(relation.type.through) continue

        if(relation.type === 'has_many' && !relation.through){
          if(this.relations[relation.name] && this.relations[relation.name].length > 0){
            for(var j = 0; j < this[relation.name].length; j++){
              (function(relation, subrecord){
                tmp.push(function(done){
                  subrecord[relation.foreign_key] = record[relation.primary_key]
                  return subrecord.save()
                })
              })(relation, this[relation.name][j])
            }
          }
        }


        if(relation.type === 'has_one' && !relation.through){
          if(this[relation.name]){
            (function(relation){
              tmp.push(function(done){
                thisRecord[relation.name][relation.foreign_key] = record[relation.primary_key]
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
