/*
 * STORE
 */
exports.store = {
  handleException: function(exception){
    if(this.throw) throw exception; //throw errors

    if(this.listeners('exception').length > 0){
      this.emit('exception', exception);
    }else{
      if(this.logger.error){
        this.logger.error(exception.stack ? exception.stack : exception);
      }else{
        console.error('UNHANDLED ERROR:', exception.stack ? exception.stack : exception)
      }
    }
  }
};
