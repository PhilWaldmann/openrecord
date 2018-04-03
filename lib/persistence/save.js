/*
 * RECORD
 */
exports.record = {

  /**
   * Save the current record
   * @class Record
   * @method save
   */
  save: function(options){
    var self = this
    options = options || {}

    if(typeof options === 'function') throw new Error('then!')
    return self.validate()
    .then(function(){
      return self._create_or_update(options)
    })
    .then(function(){
      return self
    })    
  },


  _create_or_update: function(){
    throw new Error('not implemented')
  }
}


/*
 * CHAIN
 */
exports.chain = {
  save: function(options){
    const self = this
    
    const lazyOperations = self.getInternal('lazy_operations')
        
    return Promise.all(
      self.map(function(record){
        return record.save(options)
      })
      .concat(lazyOperations)
    )
    .then(function(){      
      self.setInternal('resolved', true)
      return self
    })
  }
}