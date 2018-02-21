
exports.model = {

  /**
   * Executes the find
   *
   * @class Model
   * @method exec
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   */
  exec: function(resolve){
    var self = this.chain()

    // if .find(null) was called
    if(self.getInternal('exec_null')){
      return Promise.resolve(null)
    }

    var dataLoaded = self.getInternal('data_loaded')
    var options = self.getExecOptions()
    var data = {}

    if(dataLoaded) data.result = dataLoaded

    return self.callInterceptors('beforeFind', [options])
    .then(function(){
      return self.callInterceptors('onFind', [options, data])
    })
    .then(function(){
      var asRaw = self.getInternal('as_raw')
      if(!asRaw){
        return self.callInterceptors('afterFind', [data])
      }
    })
    .then(function(){
      return data.result
    })
    .then(resolve)
  },


  then: function(resolve, reject){
    var self = this.chain()

    if(self.getInternal('resolved') || self.getInternal('relation_to')){
      Object.defineProperty(self, 'then', {
        value: undefined
      })
      if(typeof resolve !== 'function') return
      return resolve(self)
    }

    return self.exec()
    .then(resolve, reject)
  },


  getExecOptions: function(){
    return {}
  }
}
