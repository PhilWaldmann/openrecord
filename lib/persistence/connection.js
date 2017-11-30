/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    if(!this.config.disableAutoConnect){
      this.connect()
    }else{
      var self = this
      Object.defineProperty(this, 'connection', {
        enumerable: false,
        value: function(){
          self.connect()
          return self.connection
        }
      })
    }
  },

  connect: function(){

  },

  close: function(){

  }
}
