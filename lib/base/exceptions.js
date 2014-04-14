/*
 * STORE
 */
exports.store = {  
  handleException: function(exception){
    if(this.listeners('exception').length > 0){
      this.emit('exception', exception);
    }else{
      console.log(exception);
    }
  }
};