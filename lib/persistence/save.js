/*
 * RECORD
 */
exports.record = {
  save: function(){
    throw new Error('not implemented!')
  }
}


/*
 * CHAIN
 */
exports.chain = {
  save: function(options){
    const self = this
    
    return Promise.all(
      self.map(function(record){
        return record.save(options)
      })
    )
    .then(function(){      
      self.setInternal('resolved', true)
      return self
    })
  }
}