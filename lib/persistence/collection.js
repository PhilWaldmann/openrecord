


/*
 * CHAIN
 */
exports.chain = {

  // add: function(records){
  //   var self = this.callParent(records)

  //   var relation = self.getInternal('relation')
  //   var parentRecord = self.getInternal('relation_to')

  //   if(!Array.isArray(records)) records = [records]

  //   for(var i = 0; i < records.length; i++){
  //     var record = records[i]
  //     if(typeof record !== 'object'){
  //       if(!relation || !relation.through || !parentRecord) continue

  //       var throughRel = parentRecord.model.definition.relations[relation.through]
  //       var targetRel = throughRel.model.definition.relations[relation.relation]

  //       var tmp = {}
  //       var base

  //       for(base in throughRel.conditions){
  //         if(throughRel.conditions[base] && throughRel.conditions[base].attribute){
  //           tmp[base] = parentRecord[throughRel.conditions[base].attribute]
  //         }else{
  //           tmp[base] = throughRel.conditions[base]
  //         }
  //       }

  //       for(base in targetRel.conditions){
  //         if(targetRel.conditions[base] && targetRel.conditions[base].attribute){
  //           tmp[targetRel.conditions[base].attribute] = record
  //         }
  //       }

  //       if(throughRel.type === 'has_many' || throughRel.type === 'belongs_to_many'){
  //         parentRecord[relation.through].add(tmp)
  //       }else{
  //         parentRecord[relation.through] = tmp
  //       }
  //     }
  //   }

  //   return self
  // },

  
}




